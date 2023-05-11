import { describe, expect, it } from "vitest"
import { PaymentItem, paymentItemQuery } from "../../payment/PaymentItem"

const inclusiveTax20: PaymentItem = {
   name: "Test Item",
   price: {
      whole: 3,
      cents: 99,
   },
   taxRate: {
      name: "20%",
      rate: 20,
      type: "inclusive",
   },
}

const exclusiveTax20: PaymentItem = {
   name: "Test Item",
   price: {
      whole: 34,
      cents: 53,
   },
   taxRate: {
      name: "20%",
      rate: 20,
      type: "exclusive",
   },
}

const inclusiveTax53: PaymentItem = {
   name: "Test Item",
   price: {
      whole: 34,
      cents: 53,
   },
   taxRate: {
      name: "53%",
      rate: 53,
      type: "inclusive",
   },
}

const exclusiveTax53: PaymentItem = {
   name: "Test Item",
   price: {
      whole: 3,
      cents: 99,
   },
   taxRate: {
      name: "53%",
      rate: 53,
      type: "exclusive",
   },
}

describe("PaymentItem - getTax", () => {
   it("Should work with inclusive tax 20", () => {
      expect(paymentItemQuery.getTax(inclusiveTax20)).toStrictEqual({
         whole: 0,
         cents: 80,
      })
   })

   it("Should work with exclusive tax 20", () => {
      expect(paymentItemQuery.getTax(exclusiveTax20)).toStrictEqual({
         whole: 6,
         cents: 91,
      })
   })

   it("Should work with inclusive tax 53", () => {
      expect(paymentItemQuery.getTax(inclusiveTax53)).toStrictEqual({
         whole: 18,
         cents: 30,
      })
   })

   it("Should work with exclusive tax 53", () => {
      expect(paymentItemQuery.getTax(exclusiveTax53)).toStrictEqual({
         whole: 2,
         cents: 11,
      })
   })
})

describe("PaymentItem - getPriceWithTax", () => {
   it("Should work with inclusive tax 20", () => {
      expect(paymentItemQuery.getPriceWithTax(inclusiveTax20)).toStrictEqual({
         whole: 3,
         cents: 99,
      })
   })

   it("Should work with exclusive tax 20", () => {
      expect(paymentItemQuery.getPriceWithTax(exclusiveTax20)).toStrictEqual({
         whole: 41,
         cents: 44,
      })
   })

   it("Should work with inclusive tax 53", () => {
      expect(paymentItemQuery.getPriceWithTax(inclusiveTax53)).toStrictEqual({
         whole: 34,
         cents: 53,
      })
   })

   it("Should work with exclusive tax 53", () => {
      expect(paymentItemQuery.getPriceWithTax(exclusiveTax53)).toStrictEqual({
         whole: 6,
         cents: 10,
      })
   })
})
