import { Type, FunctionDeclaration } from '@google/genai';

const getOrderStatus: FunctionDeclaration = {
  name: 'get_order_status',
  description:
    "Look up an order by its ID and return its status, items, and total. Use this when the customer asks about an order they've placed.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      orderId: {
        type: Type.NUMBER,
        description: 'The numeric ID of the order to look up.',
      },
    },
    required: ['orderId'],
  },
};

const searchProducts: FunctionDeclaration = {
  name: 'search_products',
  description:
    'Search the product catalog by keyword, matching against product title or category. Use this when a customer asks if you carry a certain product or type of product.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The search term, e.g. "lipstick" or "fragrance".',
      },
    },
    required: ['query'],
  },
};

const createRefund: FunctionDeclaration = {
  name: 'create_refund',
  description:
    "This is how you handle a customer's refund request — call this tool yourself rather than telling the customer to contact someone else. It files a pending refund for a human to review; it does not move any money immediately. You must verify the order belongs to the customer's account before filing. Call it once you know the customer's account email, the order ID, the refund amount, and the reason.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerEmail: {
        type: Type.STRING,
        description: "The customer's account email address, used to verify they own the order.",
      },
      orderId: {
        type: Type.NUMBER,
        description: 'The numeric ID of the order being refunded.',
      },
      amount: {
        type: Type.NUMBER,
        description: 'The dollar amount to refund.',
      },
      reason: {
        type: Type.STRING,
        description: "The customer's stated reason for the refund.",
      },
    },
    required: ['customerEmail', 'orderId', 'amount', 'reason'],
  },
};
const createSupportTicket: FunctionDeclaration = {
  name: 'create_support_ticket',
  description:
    "Escalate an issue to a human by creating a support ticket. Use this for complaints, general questions, or anything you can't resolve with your other tools (e.g. rude delivery staff, a policy question, something ambiguous). You need the customer's account email to find their record — ask for it if you don't already have it.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerEmail: {
        type: Type.STRING,
        description: "The customer's account email address.",
      },
      orderId: {
        type: Type.NUMBER,
        description: 'Optional. The order this ticket relates to, if any.',
      },
      message: {
        type: Type.STRING,
        description: "A clear summary of the customer's issue or question.",
      },
    },
    required: ['customerEmail', 'message'],
  },
};

export const tools = [
  {
    functionDeclarations: [
      getOrderStatus,
      searchProducts,
      createRefund,
      createSupportTicket,
    ],
  },
];