import Decimal from "decimal.js"
import { Currency } from "../common"
import { PaymentItem, paymentItemQuery } from "./PaymentItem"
import { StructuralMap } from "../utils/StructuralMap"
import { StructuralSet } from "../utils/StructuralSet"
import { stringifyObjectWithOrderedKeys } from "../utils/stringifyWithOrderedKeys"

function getTaxRates(payment: Payment): StructuralSet<Decimal> {
   const taxRates = new StructuralSet<Decimal>()
   for (const [item] of payment.items) {
      taxRates.add(item.taxRate)
   }
   return taxRates
}

function getPriceWithoutTax(payment: Payment): Decimal {
   return getPrice(payment, paymentItemQuery.getPriceWithoutTax)
}

function getPriceWithTax(payment: Payment): Decimal {
   return getPrice(payment, paymentItemQuery.getPriceWithTax)
}

function getTaxAmountsForTaxRates(
   payment: Payment,
): StructuralMap<Decimal, Decimal> {
   // TODO: map doesnt work how i thought, fix
   const taxes = new StructuralMap<Decimal, Decimal>()
   for (const taxRate of getTaxRates(payment)) {
      taxes.set(taxRate, getTaxAmountForTaxRate(payment, taxRate))
   }
   return taxes
}

function getTaxAmountForTaxRate(payment: Payment, taxRate: Decimal): Decimal {
   let tax = new Decimal(0)
   for (const [item, quantity] of payment.items) {
      if (
         stringifyObjectWithOrderedKeys(item.taxRate) ===
         stringifyObjectWithOrderedKeys(taxRate)
      ) {
         const itemTax = paymentItemQuery.getTax(item, quantity)
         tax = tax.plus(itemTax)
      }
   }
   return tax
}

function getPrice(
   payment: Payment,
   itemFn: (item: PaymentItem, quantity?: Decimal) => Decimal,
): Decimal {
   let price = new Decimal(0)
   for (const [item, quantity] of payment.items) {
      const itemPrice = itemFn(item, quantity)
      price = price.plus(itemPrice)
   }
   return price
}

function getItemsWithDefaultTaxRate(
   payment: Payment,
): Map<Omit<PaymentItem, "taxRate"> & { taxRate: Decimal }, Decimal> {
   const items = new Map<
      Omit<PaymentItem, "taxRate"> & { taxRate: Decimal },
      Decimal
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
   item: Omit<PaymentItem, "taxRate"> & { taxRate: Decimal },
   quantity: Decimal,
): void {
   payment.items.set(item, quantity)
}

type Payment = {
   items: Map<PaymentItem, Decimal>
   currency: Currency
}

export type { Payment }
export const paymentQuery = {
   getTaxAmountsForTaxRates,
   getTaxAmountForTaxRate,
   getTaxRates,
   getItemsWithDefaultTaxRate,
   getPriceWithoutTax,
   getPriceWithTax,
}

export const paymentMutation = {
   addItem,
}
