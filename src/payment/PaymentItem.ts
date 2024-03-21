import Decimal from "decimal.js"
import { z } from "zod"
import { positiveDecimal } from "../common/decimal"

/**
 * Get the price of a payment item without tax
 *
 * @param item The item to get the price from
 * @param quantity The quantity of the item to get the price from
 * @returns The price of the item without tax
 */

function getPriceWithoutTax(item: PaymentItem, quantity?: Decimal): Decimal {
   const { priceWithoutTax } = item

   return priceWithoutTax.times(quantity ?? new Decimal(1))
}

/**
 * Get the price of a payment item with tax
 *
 * @param item The item to get the price from
 * @param quantity The quantity of the item to get the price from
 * @returns The price of the item with tax
 */

function getPriceWithTax(item: PaymentItem, quantity?: Decimal): Decimal {
   const { priceWithoutTax, taxRate } = item

   const price = priceWithoutTax.times(quantity ?? new Decimal(1))
   const tax = price.times(taxRate.dividedBy(100))

   return price.plus(tax)
}

/**
 * Get the tax value of a payment item
 *
 * @param item The item to get the tax value from
 * @param quantity The quantity of the item to get the tax value from
 * @returns The tax value of the item
 */

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

/**
 * Transform a payment item with inclusive tax to a payment item with exclusive tax
 * For more information about their difference, see
 * @link https://stripe.com/docs/billing/taxes/tax-rates#inclusive-vs-exclusive-tax
 *
 * @param item The item to transform
 * @returns The transformed item
 */

function fromInclusiveTaxRate(item: PaymentItemWithInclusiveTax): PaymentItem {
   const { priceWithTax, taxRate } = item

   const mutliplier = new Decimal(1).minus(taxRate.dividedBy(100))
   const priceWithoutTax = priceWithTax.times(mutliplier)

   return {
      ...item,
      priceWithoutTax,
   }
}

function create(item: PaymentItem | PaymentItemWithInclusiveTax): PaymentItem {
   if ("priceWithTax" in item) {
      return fromInclusiveTaxRate(item)
   }

   return item
}

type Discount = {
   type: "fixed" | "percentage"
   amount: Decimal
}

function createDiscount(
   forItem: PaymentItem | PaymentItemWithInclusiveTax,
   discount: Discount,
   opts: {
      name: (originalName: string) => string
   } = {
      name: (originalName) => `${originalName} - Zľava`,
   },
) {
   const item = create(forItem)

   const { taxRate } = item
   const { type, amount } = discount
   const priceWithoutTax = (
      type === "fixed"
         ? amount
         : item.priceWithoutTax.times(amount.dividedBy(100))
   ).times(-1)

   return create({
      name: opts.name(item.name),
      priceWithoutTax,
      taxRate,
   })
}

type PaymentItem = z.infer<typeof schema>

const schema = z.object({
   name: z.string(),
   priceWithoutTax: positiveDecimal,
   taxRate: positiveDecimal,
   description: z.string().optional(),
   imageUrl: z.string().optional(),
})

const PaymentItem = {
   getTax,
   getPriceWithTax,
   getPriceWithoutTax,
   create,
   createDiscount,
   getSchema: () => schema,
}

export { PaymentItem }
