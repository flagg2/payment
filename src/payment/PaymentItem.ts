import { Price, priceMutation, priceQuery } from "./Price"
import { TaxRate } from "./TaxRate"
import Decimal from "decimal.js"

function getPriceWithoutTax(
   item: PaymentItem,
   opts?: {
      roundCents?: boolean
   },
): Price {
   const { price, taxRate } = item
   const cents = new Decimal(priceQuery.getAsCents(price, opts))
   const rate = new Decimal(taxRate.rate)

   let tax: Decimal

   if (taxRate.type === "exclusive") {
      tax = new Decimal(0)
   } else {
      tax = cents.times(rate.dividedBy(100))
   }

   return priceMutation.fromCents(cents.minus(tax).toNumber(), opts)
}

function getPriceWithTax(
   item: PaymentItem,
   opts?: {
      roundCents?: boolean
   },
): Price {
   const { price, taxRate } = item
   const cents = new Decimal(priceQuery.getAsCents(price, opts))
   const rate = new Decimal(taxRate.rate)

   let tax: Decimal

   if (taxRate.type === "exclusive") {
      tax = cents.times(rate.dividedBy(100))
   } else {
      tax = new Decimal(0)
   }

   return priceMutation.fromCents(cents.plus(tax).toNumber(), opts)
}

function getTax(item: PaymentItem): Price {
   const { price, taxRate } = item
   const cents = new Decimal(priceQuery.getAsCents(price))
   const rate = new Decimal(taxRate.rate)

   return priceMutation.fromCents(cents.times(rate.dividedBy(100)).toNumber())
}

type PaymentItem = {
   name: string
   price: Price
   taxRate: TaxRate
   description?: string
   imageUrl?: string
}

export type { PaymentItem }
export const paymentItemQuery = {
   getTax,
   getPriceWithTax,
   getPriceWithoutTax,
}
