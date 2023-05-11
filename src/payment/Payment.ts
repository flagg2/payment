import Decimal from "decimal.js"
import { Currency } from "../common"
import { PaymentItem, paymentItemQuery } from "./PaymentItem"
import { Price, priceMutation, priceQuery } from "./Price"
import { TaxRate } from "./TaxRate"

function getTaxRates(payment: Payment): Set<TaxRate> {
   const taxRates = new Set<TaxRate>()
   for (const [item] of payment.items) {
      taxRates.add(item.taxRate)
   }
   return taxRates
}

function getPriceWithoutTax(payment: Payment): Price {
   return getPrice(payment, paymentItemQuery.getPriceWithoutTax)
}

function getPriceWithTax(payment: Payment): Price {
   return getPrice(payment, paymentItemQuery.getPriceWithTax)
}

function getPrice(
   payment: Payment,
   itemFn: (
      item: PaymentItem,
      opts?: {
         roundCents?: boolean
      },
   ) => Price,
): Price {
   let priceCents = new Decimal(0)
   for (const [item, quantity] of payment.items) {
      const itemPrice = itemFn(item, {
         roundCents: false,
      })
      const itemPriceCents = new Decimal(
         priceQuery.getAsCents(itemPrice, { roundCents: false }),
      )
      priceCents = priceCents.plus(itemPriceCents.times(quantity))
   }
   return priceMutation.fromCents(priceCents.toNumber())
}

function getItemsWithDefaultTaxRate(
   payment: Payment,
): Map<Omit<PaymentItem, "taxRate"> & { taxRate: TaxRate }, number> {
   const items = new Map<
      Omit<PaymentItem, "taxRate"> & { taxRate: TaxRate },
      number
   >()
   for (const [item, quantity] of payment.items) {
      items.set(
         {
            ...item,
            taxRate: item.taxRate,
         },
         quantity,
      )
   }
   return items
}

function addItem(
   payment: Payment,
   item: Omit<PaymentItem, "taxRate"> & { taxRate: TaxRate },
   quantity: number,
): void {
   payment.items.set(item, quantity)
}

type Payment = {
   items: Map<PaymentItem, number>
   currency: Currency
}

export type { Payment }
export const paymentQuery = {
   getTaxRates,
   getItemsWithDefaultTaxRate,
   getPriceWithoutTax,
   getPriceWithTax,
}

export const paymentMutation = {
   addItem,
}
