import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { RefundsService } from '../refunds/refunds.service';
import { tools } from './tools';

const MODEL = 'gemini-3.5-flash-lite';

const SYSTEM_INSTRUCTION = `You are a friendly customer support agent for an online store.

Important rules you must always follow:
- Never claim you have completed an action (like filing a refund) unless you actually called the matching tool and it returned success. If you have not called a tool, the action has not happened — do not describe it as done.
- If you're missing information needed to call a tool (for example, a refund amount), ask the customer, or use a previous tool result to work it out yourself. Never guess or invent a number.
- Refunds are filed as PENDING and reviewed by a person before any money moves. Never tell a customer their money has already been refunded, or give a specific timeframe like "3-5 business days" — you have no way of actually knowing that.
- You have real tools to look up orders, search products, and file refunds. When a customer wants a refund and you know the order ID, amount, and reason, actually call the create_refund tool yourself — don't tell them to contact another team, since filing the request IS something you can do.`;

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
        const orderId = args.orderId as number;
        const amount = args.amount as number;
        const reason = args.reason as string;

        const order = await this.ordersService.findOne(orderId);
        if (!order) {
          return {
            error: `No order found with ID ${orderId}. Can't file a refund for it.`,
          };
        }

        const refund = await this.refundsService.create({
          orderId,
          amount,
          reason,
        });

        return {
          refundId: refund.id,
          status: refund.status,
          message:
            'Refund request filed successfully and is pending review by our team.',
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