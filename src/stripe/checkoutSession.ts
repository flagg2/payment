import { Stripe as StripeSdk } from "stripe"
import { Payment } from "../payment/Payment"
import { AsyncResult, Result } from "@flagg2/result"
import { Price } from "../payment/Price"
import { getTaxRateMap } from "./taxRate"

type StripeCheckoutSession = StripeSdk.Checkout.Session
type StripeLineItem = StripeSdk.Checkout.SessionCreateParams.LineItem

export async function createCheckoutSession(
   client: StripeSdk,
   payment: Payment,
   urls: {
      successUrl: string
      cancelUrl: string
   },
): AsyncResult<StripeCheckoutSession> {
   const lineItems = await getLineItems(client, payment)
   if (lineItems.isErr()) {
      return Result.err(lineItems.error)
   }

   const { successUrl, cancelUrl } = urls

   const session = await Result.from(
      client.checkout.sessions.create({
         payment_method_types: ["card"],
         mode: "payment",
         line_items: lineItems.value,
         success_url: successUrl,
         cancel_url: cancelUrl,
      }),
   )
   if (session.isErr()) {
      return Result.err(session.error)
   }
   return Result.ok(session.value)
}

async function getLineItems(
   client: StripeSdk,
   payment: Payment,
): AsyncResult<StripeLineItem[]> {
   const taxRateMap = await getTaxRateMap(client, payment)
   if (taxRateMap.isErr()) {
      return Result.err(taxRateMap.error)
   }
   const { items } = payment
   const lineItems: StripeLineItem[] = []
   for (const [item, quantity] of items.entries()) {
      const taxRate = taxRateMap.value.get(item.taxRate)
      if (taxRate === undefined) {
         return Result.err(new Error("Tax rate not found"))
      }
      lineItems.push({
         quantity: quantity.toNumber(),
         tax_rates: [taxRate.id],
         price_data: {
            currency: payment.currency,
            unit_amount: Price.toCents(item.priceWithoutTax).toNumber(),
            product_data: {
               name: item.name,
               description: item.description,
               ...(item.imageUrl !== undefined && {
                  images: [item.imageUrl],
               }),
            },
         },
      })
   }

   return Result.ok(lineItems)
}
