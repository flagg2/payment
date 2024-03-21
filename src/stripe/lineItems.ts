import { Result } from "@flagg2/result"
import { Payment } from "../payment/Payment"
import { Stripe as StripeSdk } from "stripe"
import { getTaxRateMap } from "./taxRate"
import { StripeClient } from "./Client"

type StripeLineItem = StripeSdk.Checkout.SessionCreateParams.LineItem

export async function getLineItems(client: StripeClient, payment: Payment) {
   const taxRateMap = await getTaxRateMap(client, payment)
   if (taxRateMap.isErr()) {
      return taxRateMap
   }
   const { items } = payment
   const lineItems: StripeLineItem[] = []
   for (const [item, quantity] of items.entries()) {
      const taxRate = taxRateMap.value.get(item.taxRate)
      if (taxRate === undefined) {
         return Result.err("TAX_RATE_NOT_FOUND")
      }
      lineItems.push({
         quantity: quantity.toNumber(),
         tax_rates: [taxRate.id],
         price_data: {
            currency: payment.currency,
            unit_amount: item.priceWithoutTax.times(100).toNumber(),
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
