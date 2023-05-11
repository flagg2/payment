import { beforeEach, describe, expect, it } from "vitest"
import { Payment, paymentMutation, paymentQuery } from "../../payment/Payment"
import { PaymentItem } from "../../payment/PaymentItem"

let payment1: Payment
const bigMac: PaymentItem = {
   name: "Big Mac",
   price: {
      whole: 3,
      cents: 99,
   },
   taxRate: {
      name: "21%",
      rate: 21,
      type: "inclusive",
   },
}

describe("Payment - One item", () => {
   beforeEach(() => {
      payment1 = {
         currency: "EUR",
         items: new Map([]),
      }

      paymentMutation.addItem(payment1, bigMac, 1)
   })

   it("Should return correct price with tax", () => {
      expect(payment1.items.size).toBe(1)
      expect(paymentQuery.getPriceWithTax(payment1)).toStrictEqual({
         whole: 3,
         cents: 99,
      })
   })

   it("Should return correct price without tax", () => {
      expect(payment1.items.size).toBe(1)
      expect(paymentQuery.getPriceWithoutTax(payment1)).toStrictEqual({
         whole: 3,
         cents: 15,
      })
   })
})

describe("Payment - Same item many times", () => {
   beforeEach(() => {
      payment1 = {
         currency: "EUR",
         items: new Map([]),
      }

      paymentMutation.addItem(payment1, bigMac, 31)
   })

   it("Should return correct price with tax", () => {
      expect(payment1.items.size).toBe(1)
      expect(paymentQuery.getPriceWithTax(payment1)).toStrictEqual({
         whole: 123,
         cents: 69,
      })
   })

   it("Should return correct price without tax", () => {
      expect(payment1.items.size).toBe(1)
      expect(paymentQuery.getPriceWithoutTax(payment1)).toStrictEqual({
         whole: 97,
         cents: 72,
      })
   })
})
