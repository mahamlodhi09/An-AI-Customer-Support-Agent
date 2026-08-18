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
    "This is how you handle a customer's refund request — call this tool yourself rather than telling the customer to contact someone else. It files a pending refund for a human to review; it does not move any money immediately. Call it as soon as you know the order ID, the refund amount, and the reason.",
  parameters: {
    type: Type.OBJECT,
    properties: {
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
    required: ['orderId', 'amount', 'reason'],
  },
};
export const tools = [
  { functionDeclarations: [getOrderStatus, searchProducts] },
];