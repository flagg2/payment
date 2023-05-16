import { beforeEach, describe, expect, it } from "vitest"
import { Payment } from "../../payment/Payment"
import { PaymentItem } from "../../payment/PaymentItem"
import { StructuralMap } from "../../utils/StructuralMap"
import { Price } from "../../payment/Price"
import Decimal from "decimal.js"

let payment1: Payment
const bigMac: PaymentItem = {
   name: "Big Mac",
   priceWithoutTax: new Decimal(3.99),
   taxRate: new Decimal(21),
}

const fries: PaymentItem = {
   name: "Fries",
   priceWithoutTax: new Decimal(2.15),
   taxRate: new Decimal(21),
}

describe("Price calculation", () => {
   describe("One item", () => {
      beforeEach(() => {
         payment1 = {
            currency: "EUR",
            items: new Map([]),
         }

         Payment.addItem(payment1, bigMac, new Decimal(1))
      })

      it("Should return correct price with tax", () => {
         expect(payment1.items.size).toBe(1)
         expect(Payment.getPriceWithTax(payment1)).toStrictEqual(
            new Decimal(4.8279),
         )
      })

      it("Should return correct price without tax", () => {
         expect(payment1.items.size).toBe(1)
         expect(Payment.getPriceWithoutTax(payment1)).toStrictEqual(
            new Decimal(3.99),
         )
      })
   })

   describe("Same item many times", () => {
      beforeEach(() => {
         payment1 = {
            currency: "EUR",
            items: new Map([]),
         }

         Payment.addItem(payment1, bigMac, new Decimal(31))
      })

      it("Should return correct price with tax", () => {
         expect(payment1.items.size).toBe(1)
         expect(Payment.getPriceWithTax(payment1)).toStrictEqual(
            new Decimal(149.6649),
         )
      })

      it("Should return correct price without tax", () => {
         expect(payment1.items.size).toBe(1)
         expect(Payment.getPriceWithoutTax(payment1)).toStrictEqual(
            new Decimal(123.69),
         )
      })
   })
})

describe("Tax map", () => {
   it.only("Should work with one item", () => {
      payment1 = {
         currency: "EUR",
         items: new Map([]),
      }

      Payment.addItem(payment1, bigMac, new Decimal(1))

      const expected = new StructuralMap<object, Price>()
      expected.set(new Decimal(21), new Decimal(0.8379))

      console.log(Payment.getTaxAmountsForTaxRates(payment1).keys()[0])

      expect(Payment.getTaxAmountsForTaxRates(payment1)).toStrictEqual(expected)
   })

   it("Should work with many items", () => {
      payment1 = {
         currency: "EUR",
         items: new Map([]),
      }

      Payment.addItem(payment1, bigMac, new Decimal(31))

      const expected = new StructuralMap()
      expected.set(new Decimal(21), new Decimal(25.9749))

      expect(Payment.getTaxAmountsForTaxRates(payment1)).toStrictEqual(expected)
   })

   it("Should group items with same tax rate", () => {
      payment1 = {
         currency: "EUR",
         items: new Map([]),
      }

      Payment.addItem(payment1, bigMac, new Decimal(1))
      Payment.addItem(payment1, fries, new Decimal(1))

      const structuralMap = Payment.getTaxAmountsForTaxRates(payment1)

      expect(structuralMap.size).toBe(1)
      expect(structuralMap.get(bigMac.taxRate)).toStrictEqual(
         new Decimal(1.2894),
      )
   })
})
