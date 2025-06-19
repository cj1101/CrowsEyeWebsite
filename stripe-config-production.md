# Stripe PAYG Production Configuration

## Environment Variables for Production

Add these to your Firebase hosting environment variables:

```bash
STRIPE_PAYG_PRODUCT_ID=prod_SWq0XFsm6MYTzX
STRIPE_AI_CREDITS_PRICE_ID=price_1RbmLgGU2Wb0yZINUBfTAq0m
STRIPE_POSTS_PRICE_ID=price_1RbmMAGU2Wb0yZINY9JkdqEw
STRIPE_STORAGE_PRICE_ID=price_1RbmL2GU2Wb0yZIN6BrcrrV7
```

## Firebase CLI Commands to Set Environment Variables

```bash
firebase functions:config:set stripe.payg_product_id="prod_SWq0XFsm6MYTzX"
firebase functions:config:set stripe.ai_credits_price_id="price_1RbmLgGU2Wb0yZINUBfTAq0m"
firebase functions:config:set stripe.posts_price_id="price_1RbmMAGU2Wb0yZINY9JkdqEw"
firebase functions:config:set stripe.storage_price_id="price_1RbmL2GU2Wb0yZIN6BrcrrV7"
```

## Next.js Environment Variables for Build

For the Next.js build process, these values are now hardcoded as fallbacks in the code:

- Product ID: `prod_SWq0XFsm6MYTzX`
- AI Credits Price ID: `price_1RbmLgGU2Wb0yZINUBfTAq0m`
- Scheduled Posts Price ID: `price_1RbmMAGU2Wb0yZINY9JkdqEw`
- Storage Price ID: `price_1RbmL2GU2Wb0yZIN6BrcrrV7`

These are configured in `src/lib/stripe.ts` as fallback values if environment variables are not set. 