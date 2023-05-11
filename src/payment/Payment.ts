import { Currency } from "../common"
import { PaymentItem, Price } from "./PaymentItem"
import { TaxRate } from "./TaxRate"

function getTaxRates(payment: Payment): Set<TaxRate> {
   const taxRates = new Set<TaxRate>()
   for (const [item] of payment.items) {
      taxRates.add(item.taxRate)
   }
   return taxRates
}

function getTotalPrice(payment: Payment): Price {
   const totalPrice: Price = {
      whole: 0,
      decimal: 0,
   }
   for (const [item, quantity] of payment.items) {
      totalPrice.whole += item.price.whole * quantity
      totalPrice.decimal += item.price.decimal * quantity
   }

   totalPrice.whole += Math.floor(totalPrice.decimal / 100)
   totalPrice.decimal %= 100

   return totalPrice
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
   getTotalPrice,
   getItemsWithDefaultTaxRate,
}

export const paymentMutation = {
   addItem,
}
