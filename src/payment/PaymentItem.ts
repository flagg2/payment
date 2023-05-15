import { Price } from "./Price"
import Decimal from "decimal.js"

function getPriceWithoutTax(item: PaymentItem, quantity?: Decimal): Decimal {
   const { priceWithoutTax } = item

   return priceWithoutTax.times(quantity ?? new Decimal(1))
}

function getPriceWithTax(item: PaymentItem, quantity?: Decimal): Decimal {
   const { priceWithoutTax, taxRate } = item

   const price = priceWithoutTax.times(quantity ?? new Decimal(1))
   const tax = price.times(taxRate.dividedBy(100))

   return price.plus(tax)
}

function getTax(item: PaymentItem, quantity?: Decimal): Decimal {
   const { priceWithoutTax, taxRate } = item
   const decimalQuantity = new Decimal(quantity ?? 1)

   const price = priceWithoutTax.times(decimalQuantity)

   return price.times(taxRate.dividedBy(100))
}

type PaymentItemWithInclusiveTax = {
   name: string
   priceWithTax: Decimal
   taxRate: Decimal
   description?: string
   imageUrl?: string
}

function fromInclusiveTaxRate(item: PaymentItemWithInclusiveTax) {
   const { priceWithTax, taxRate } = item

   const mutliplier = new Decimal(1).minus(taxRate.dividedBy(100))
   const priceWithoutTax = priceWithTax.times(mutliplier)

   return {
      ...item,
      priceWithoutTax,
   }
}

type PaymentItem = {
   name: string
   priceWithoutTax: Decimal
   taxRate: Decimal
   description?: string
   imageUrl?: string
}

export type { PaymentItem }
export const paymentItemQuery = {
   getTax,
   getPriceWithTax,
   getPriceWithoutTax,
}

export const paymentItemMutation = {
   fromInclusiveTaxRate,
}
