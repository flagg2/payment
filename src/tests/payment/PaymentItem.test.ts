import { describe, expect, it } from "vitest"
import {
   PaymentItem,
   paymentItemMutation,
   paymentItemQuery,
} from "../../payment/PaymentItem"
import Decimal from "decimal.js"

const exclusiveTax20: PaymentItem = {
   name: "Test Item",
   priceWithoutTax: new Decimal(34.53),
   taxRate: new Decimal(20),
}

const exclusiveTax53: PaymentItem = {
   name: "Test Item",
   priceWithoutTax: new Decimal(3.99),
   taxRate: new Decimal(53),
}

const mcFlurry: PaymentItem = {
   name: "McFlurry",
   priceWithoutTax: new Decimal(2.69),
   taxRate: new Decimal(21),
}

describe("PaymentItem - getTax", () => {
   it("Should work with exclusive tax 20", () => {
      expect(paymentItemQuery.getTax(exclusiveTax20)).toEqual(
         new Decimal(6.906),
      )
   })

   it("Should work with exclusive tax 53", () => {
      expect(paymentItemQuery.getTax(exclusiveTax53)).toEqual(
         new Decimal(2.1147),
      )
   })

   it("Should work with inclusive tax 21", () => {
      expect(paymentItemQuery.getTax(mcFlurry)).toEqual(new Decimal(0.5649))
   })
})

describe("PaymentItem - getPriceWithTax", () => {
   it("Should work with exclusive tax 20", () => {
      expect(paymentItemQuery.getPriceWithTax(exclusiveTax20)).toEqual(
         new Decimal(41.436),
      )
   })

   it("Should work with exclusive tax 53", () => {
      expect(paymentItemQuery.getPriceWithTax(exclusiveTax53)).toEqual(
         new Decimal(6.1047),
      )
   })
})

describe("From inclusive tax rate", () => {
   it("Should work with inclusive tax 21", () => {
      const item = paymentItemMutation.fromInclusiveTaxRate({
         name: "McFlurry",
         priceWithTax: new Decimal(3.25),
         taxRate: new Decimal(21),
      })

      expect(item.priceWithoutTax).toEqual(new Decimal(2.5675))
   })
})
