import { describe, expect, it } from "vitest"
import { PaymentItem } from "../../payment/PaymentItem"
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
      expect(PaymentItem.getTax(exclusiveTax20)).toEqual(new Decimal(6.906))
   })

   it("Should work with exclusive tax 53", () => {
      expect(PaymentItem.getTax(exclusiveTax53)).toEqual(new Decimal(2.1147))
   })

   it("Should work with inclusive tax 21", () => {
      expect(PaymentItem.getTax(mcFlurry)).toEqual(new Decimal(0.5649))
   })
})

describe("PaymentItem - getPriceWithTax", () => {
   it("Should work with exclusive tax 20", () => {
      expect(PaymentItem.getPriceWithTax(exclusiveTax20)).toEqual(
         new Decimal(41.436),
      )
   })

   it("Should work with exclusive tax 53", () => {
      expect(PaymentItem.getPriceWithTax(exclusiveTax53)).toEqual(
         new Decimal(6.1047),
      )
   })
})

describe("From inclusive tax rate", () => {
   it("Should work with inclusive tax 21", () => {
      const item = PaymentItem.create({
         name: "McFlurry",
         priceWithTax: new Decimal(3.25),
         taxRate: new Decimal(21),
      })

      expect(item.priceWithoutTax).toEqual(new Decimal(2.5675))
   })
})

describe("PaymentItem - createDiscount", () => {
   it("Should work with 10% discount", () => {
      const item = PaymentItem.createDiscount(exclusiveTax20, {
         type: "percentage",
         amount: new Decimal(10),
      })

      expect(item.priceWithoutTax).toEqual(new Decimal(-3.453))
      expect(item.taxRate).toEqual(new Decimal(20))
      expect(item.name).toEqual("Test Item - Zľava")

      expect(PaymentItem.getPriceWithoutTax(item)).toEqual(new Decimal(-3.453))
      expect(PaymentItem.getPriceWithTax(item)).toEqual(new Decimal(-4.1436))
   })

   it("Should work with fixed 10 EUR discount", () => {
      const item = PaymentItem.createDiscount(exclusiveTax20, {
         type: "fixed",
         amount: new Decimal(10),
      })

      expect(item.priceWithoutTax).toEqual(new Decimal(-10))
      expect(item.taxRate).toEqual(new Decimal(20))
      expect(item.name).toEqual("Test Item - Zľava")
   })

   it("Should work with a custom name", () => {
      const item = PaymentItem.createDiscount(
         exclusiveTax20,
         {
            type: "percentage",
            amount: new Decimal(10),
         },
         {
            name: (originalName) => `${originalName} - Discount`,
         },
      )

      expect(item.name).toEqual("Test Item - Discount")
   })
})
