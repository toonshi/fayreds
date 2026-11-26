import Stripe from "stripe";

export const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
let client: Stripe | null = null;
export function stripe() {
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY!);
  return client;
}
