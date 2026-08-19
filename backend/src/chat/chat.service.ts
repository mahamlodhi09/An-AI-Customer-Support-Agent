import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { RefundsService } from '../refunds/refunds.service';
import { CustomersService } from '../customers/customers.service';
import { SupportTicketsService } from '../support-tickets/support-tickets.service';
import { tools } from './tools';

const MODEL = 'gemini-3.5-flash-lite';

const SYSTEM_INSTRUCTION = `You are a friendly customer support agent for an online store.

Important rules you must always follow:
- Never claim you have completed an action (like filing a refund or creating a ticket) unless you actually called the matching tool and it returned success. If you have not called a tool, the action has not happened — do not describe it as done.
- If you're missing information needed to call a tool (for example, a refund amount), ask the customer, or use a previous tool result to work it out yourself. Never guess or invent a number.
- Refunds are filed as PENDING and reviewed by a person before any money moves. Never tell a customer their money has already been refunded, or give a specific timeframe like "3-5 business days" — you have no way of actually knowing that.
- You have real tools to look up orders, search products, file refunds, and create support tickets. Use them yourself rather than telling the customer to contact someone else — that IS what these tools are for.
- There is no login system, so you don't automatically know who you're talking to. If a tool needs to identify the customer (like creating a support ticket), ask for their account email first.
- If a customer raises something you can't resolve with order lookup or refunds — a complaint, a general question, anything ambiguous — create a support ticket so a human can follow up, rather than guessing or making promises.
- Refunds require verifying the customer's identity by email first, just like support tickets — never file a refund without confirming which account is asking and that they actually own the order.`;

const MAX_TOOL_ROUNDS = 5;
const MAX_HISTORY_TURNS = 20;

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

@Injectable()
export class ChatService {
  private ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  constructor(
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
    private readonly refundsService: RefundsService,
    private readonly customersService: CustomersService,
    private readonly supportTicketsService: SupportTicketsService,
  ) {}

  private async executeTool(name: string, args: Record<string, unknown>) {
    switch (name) {
      case 'get_order_status': {
        const orderId = args.orderId as number;
        const order = await this.ordersService.findOne(orderId);

        if (!order) {
          return { error: `No order found with ID ${orderId}.` };
        }

        const items = order.items.map((item) => ({
          product: item.product?.title,
          quantity: item.quantity,
          unitPrice: item.product?.price,
          lineTotal: (item.product?.price ?? 0) * item.quantity,
        }));

        const total = items.reduce((sum, i) => sum + i.lineTotal, 0);

        return {
          id: order.id,
          status: order.status,
          createdAt: order.createdAt,
          items,
          total,
        };
      }

      case 'search_products': {
        const query = args.query as string;
        const results = await this.productsService.search(query);

        if (results.length === 0) {
          return { message: `No products found matching "${query}".` };
        }

        return results.map((p) => ({
          title: p.title,
          price: p.price,
          category: p.category,
        }));
      }

      case 'create_refund': {
  const email = args.customerEmail as string;
  const orderId = args.orderId as number;
  const amount = args.amount as number;
  const reason = args.reason as string;

  const customer = await this.customersService.findByEmail(email);
  if (!customer) {
    return {
      error: `No customer account found with email ${email}. Please double-check the email address.`,
    };
  }

  const order = await this.ordersService.findOne(orderId);
  if (!order) {
    return { error: `No order found with ID ${orderId}. Can't file a refund for it.` };
  }

  // Guardrail 1: the order must actually belong to this customer.
  if (order.customerId !== customer.id) {
    return {
      error: `Order #${orderId} does not belong to the account with email ${email}. I can't file a refund for an order that isn't theirs.`,
    };
  }

  // Guardrail 2: don't allow duplicate refund requests for the same order.
  const existingRefunds = await this.refundsService.findByOrder(orderId);
  const activeRefund = existingRefunds.find((r) => r.status !== 'REJECTED');
  if (activeRefund) {
    return {
      error: `A refund for order #${orderId} already exists (refund #${activeRefund.id}, status: ${activeRefund.status}). I can't file a duplicate request for the same order.`,
    };
  }

  const refund = await this.refundsService.create({ orderId, amount, reason });

  return {
    refundId: refund.id,
    status: refund.status,
    message: 'Refund request filed successfully and is pending review by our team.',
  };
}

      case 'create_support_ticket': {
        const email = args.customerEmail as string;
        const message = args.message as string;
        const orderId = args.orderId as number | undefined;

        const customer = await this.customersService.findByEmail(email);
        if (!customer) {
          return {
            error: `No customer account found with email ${email}. Please double-check the email address.`,
          };
        }

        if (orderId) {
          const order = await this.ordersService.findOne(orderId);
          if (!order) {
            return {
              error: `No order found with ID ${orderId}. The ticket wasn't created — please confirm the order number.`,
            };
          }
        }

        const ticket = await this.supportTicketsService.create({
          customerId: customer.id,
          orderId,
          message,
        });

        return {
          ticketId: ticket.id,
          status: ticket.status,
          message: 'Support ticket created and will be reviewed by our team.',
        };
      }

      default:
        return { error: `Unknown tool: ${name}` };
    }
  }

  async sendMessage(
    userMessage: string,
    history: ChatTurn[] = [],
  ): Promise<string> {
    const trimmedHistory = history.slice(-MAX_HISTORY_TURNS);

    const contents: any[] = [
      ...trimmedHistory.map((turn) => ({
        role: turn.role,
        parts: [{ text: turn.text }],
      })),
      { role: 'user', parts: [{ text: userMessage }] },
    ];

    const config = { systemInstruction: SYSTEM_INSTRUCTION, tools };

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await this.ai.models.generateContent({
        model: MODEL,
        contents,
        config,
      });

      const calls = response.functionCalls;

      if (!calls || calls.length === 0) {
        return (
          response.text ??
          "Sorry, I wasn't able to come up with an answer for that."
        );
      }

      const modelTurn = response.candidates?.[0]?.content;
      if (modelTurn) contents.push(modelTurn);

      const responseParts = await Promise.all(
        calls.map(async (call) => ({
          functionResponse: {
            name: call.name,
            response: {
              result: await this.executeTool(call.name!, call.args ?? {}),
            },
          },
        })),
      );

      contents.push({ role: 'user', parts: responseParts });
    }

    return "Sorry, I'm having trouble answering that right now.";
  }
}