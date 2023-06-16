import Decimal from "decimal.js"
import { Currency } from "../common"
import { PaymentItem } from "./PaymentItem"
import {
   StructuralMap,
   StructuralSet,
   stringifyObjectWithOrderedKeys,
} from "@flagg2/data-structures"

/**
 * Get all different tax rates used in the payment
 *
 * @param payment The payment to get the tax rates from
 * @returns A structual set of all tax rates used in the payment
 */

function getTaxRates(payment: Payment): StructuralSet<Decimal> {
   const taxRates = new StructuralSet<Decimal>()
   for (const [item] of payment.items) {
      taxRates.add(item.taxRate)
   }
   return taxRates
}

/**
 * Get the total price of the payment without tax
 *
 * @param payment The payment to get the price from
 * @returns The total price of the payment without tax
 */

function getPriceWithoutTax(payment: Payment): Decimal {
   return getPrice(payment, PaymentItem.getPriceWithoutTax)
}

/**
 * Get the total price of the payment with tax
 *
 * @param payment The payment to get the price from
 * @returns The total price of the payment with tax
 */

function getPriceWithTax(payment: Payment): Decimal {
   return getPrice(payment, PaymentItem.getPriceWithTax)
}

/**
 * Get the value of tax that should be paid for each tax rate
 *
 * @param payment The payment to get the tax amounts from
 * @returns A structural map of tax rates and the amount of tax that should be paid for each tax rate
 */

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

/**
 * Get the value of tax that should be paid for a specific tax rate
 *
 * @param payment The payment to get the tax amount from
 * @param taxRate The tax rate to get the tax amount for
 * @returns The value of tax that should be paid for the tax rate
 */

function getTaxAmountForTaxRate(payment: Payment, taxRate: Decimal): Decimal {
   let tax = new Decimal(0)
   for (const [item, quantity] of payment.items) {
      if (
         stringifyObjectWithOrderedKeys(item.taxRate) ===
         stringifyObjectWithOrderedKeys(taxRate)
      ) {
         const itemTax = PaymentItem.getTax(item, quantity)
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

/**
 * Get the items of the payment with the default tax rate added to them
 *
 * @param payment The payment to get the items from
 * @returns A map of items with the default tax rate added to them
 */

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

/**
 * Add an item to the payment
 *
 * @param payment The payment to add the item to
 * @param item The item to add to the payment
 * @param quantity The quantity of the item to add to the payment
 */
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

const Payment = {
   getTaxAmountsForTaxRates,
   getTaxAmountForTaxRate,
   getTaxRates,
   getItemsWithDefaultTaxRate,
   getPriceWithoutTax,
   getPriceWithTax,
   addItem,
}

export { Payment }
