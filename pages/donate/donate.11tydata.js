const Stripe = require('stripe');

module.exports = async () => {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const { data: products = [] } = await stripe.products.list();

  const options = await Promise.all(
    products.map(async (option) => {
      const { data: prices } = await stripe.prices.list({ product: option.id });
      const price = {
        ...prices[0],
        formatted_amount: prices[0].unit_amount / 100,
      };

      return { ...option, price };
    }),
  );

  const donationOptions = (options || []).sort(
    (option) => -parseInt(option.price.unit_amount),
  );

  console.log({
    donationOptions,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });

  return {
    hasDonationOptions: donationOptions.length > 0,
    donationOptions,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  };
};
