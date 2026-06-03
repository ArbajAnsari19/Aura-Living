/**
 * Domain knowledge for our fictional store, "Aura Living" — a small online
 * home & lifestyle goods shop. Seeded into the KnowledgeItem table and injected
 * into the LLM system prompt so the agent answers FAQs reliably.
 *
 * Editing the agent's knowledge = editing these rows (or the DB), not the code.
 */
export const STORE_NAME = 'Aura Living';

export interface KnowledgeSeed {
  topic: string;
  question: string;
  answer: string;
}

export const KNOWLEDGE_SEED: KnowledgeSeed[] = [
  {
    topic: 'shipping',
    question: 'What are your shipping options, costs, and delivery times?',
    answer:
      'We ship within the US and to 30+ countries worldwide. US standard shipping (3–5 business days) is FREE on orders over $50, otherwise $4.99. US express (1–2 business days) is $14.99. International shipping is $19.99 and takes 7–14 business days. Orders placed before 2 PM ET on a business day ship the same day.',
  },
  {
    topic: 'shipping',
    question: 'Do you ship to the USA / internationally?',
    answer:
      'Yes — we ship across the USA and to 30+ countries including Canada, the UK, Australia, the EU, the UAE, and India. Duties and import taxes for international orders are calculated at checkout where possible; otherwise they are the customer\'s responsibility.',
  },
  {
    topic: 'returns',
    question: 'What is your return and refund policy?',
    answer:
      'We offer a 30-day return policy from the delivery date. Items must be unused and in their original packaging. Start a return at aura-living.example/returns — we email a prepaid label for US orders. Refunds are issued to the original payment method within 5–7 business days of us receiving the item. Sale/clearance items are final sale. Return shipping for international orders is the customer\'s responsibility.',
  },
  {
    topic: 'returns',
    question: 'How do I exchange an item or report a damaged/defective product?',
    answer:
      'For exchanges, start a return and place a new order — this is the fastest way to get the size/color you want. If an item arrives damaged or defective, email support@aura-living.example within 7 days with your order number and a photo, and we\'ll ship a replacement or issue a full refund at no cost to you.',
  },
  {
    topic: 'hours',
    question: 'What are your customer support hours and how can I reach you?',
    answer:
      'Our human support team is available Monday–Friday, 9 AM–6 PM ET (closed on US public holidays). You can reach us via this chat, by email at support@aura-living.example, or by phone at 1-800-555-0142. This AI assistant is available 24/7 for common questions.',
  },
  {
    topic: 'payments',
    question: 'What payment methods do you accept?',
    answer:
      'We accept Visa, Mastercard, American Express, and Discover, plus Apple Pay, Google Pay, PayPal, and Shop Pay. All payments are processed securely; we never store full card numbers on our servers.',
  },
  {
    topic: 'orders',
    question: 'How do I track, change, or cancel my order?',
    answer:
      'You\'ll get a tracking link by email once your order ships. To change or cancel an order, contact us within 1 hour of placing it — after that it may already be in fulfillment. We can\'t modify an order once it has shipped, but you can use our 30-day return policy.',
  },
  {
    topic: 'orders',
    question: 'Do you offer discounts, coupons, or a loyalty program?',
    answer:
      'New subscribers get 10% off their first order by signing up for our newsletter at the bottom of any page. We run seasonal sales, and our Aura Rewards program earns you 1 point per $1 spent, redeemable for store credit. Only one promo code can be applied per order.',
  },
  {
    topic: 'general',
    question: 'What does Aura Living sell and where are you based?',
    answer:
      'Aura Living is a small online shop for home & lifestyle goods — think soft furnishings, ceramics, candles, organizers, and thoughtfully designed everyday objects. We\'re based in Austin, Texas, and ship from our warehouse there.',
  },
];
