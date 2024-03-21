import { it, expect, describe } from "vitest"
import { Price } from "../../payment/Price"
import Decimal from "decimal.js"

describe("Price - asWholeAndCents", () => {
   it("Should return the correct amount of cents", () => {
      const price = new Decimal(3.99)
      const result = Price.asWholeAndCents(price)
      expect(result).toStrictEqual({
         whole: new Decimal(3),
         cents: new Decimal(99),
      })
   })

   it("Should round down", () => {
      const price = new Decimal(3.504)
      const result = Price.asWholeAndCents(price)
      expect(result).toStrictEqual({
         whole: new Decimal(3),
         cents: new Decimal(50),
      })
   })

   it("Should round up", () => {
      const price = new Decimal(3.505)
      const result = Price.asWholeAndCents(price)
      expect(result).toStrictEqual({
         whole: new Decimal(3),
         cents: new Decimal(51),
      })
   })
})

describe("Price - roundTo ", () => {
   it("Should round to whole", () => {
      const price = new Decimal(3.99)
      const result = Price.roundTo(price, "whole")
      expect(result).toStrictEqual(new Decimal(4))
   })

   it("Should round down to cents", () => {
      const price = new Decimal(3.992)
      const result = Price.roundTo(price, "cents")
      expect(result).toStrictEqual(new Decimal(3.99))
   })

   it("Should round up to cents", () => {
      const price = new Decimal(3.985)
      const result = Price.roundTo(price, "cents")
      expect(result).toStrictEqual(new Decimal(3.99))
   })
})

describe("Price - getFormatted", () => {
   it("Should return the correct formatted string", () => {
      const price = new Decimal(3.99)
      const result = Price.getFormatted(price, "EUR")
      expect(result).toBe("3.99 €")
   })

   it("Should return the correct formatted string", () => {
      const price = new Decimal(3.985)
      const result = Price.getFormatted(price, "USD")
      expect(result).toBe("3.99 $")
   })

   it("Should return the correct formatted string", () => {
      const price = new Decimal(3.532)
      const result = Price.getFormatted(price, "CZK")
      expect(result).toBe("3.53 Kč")
   })
   it("Should work with discounts", () => {
      const price = new Decimal(-3.99)
      const result = Price.getFormatted(price, "CZK")
      expect(result).toBe("-3.99 Kč")
   })
})

describe("Price - fromWholeAndCents", () => {
   it("Should return the correct decimal", () => {
      const result = Price.fromWholeAndCents(3, 99)
      expect(result).toStrictEqual(new Decimal(3.99))
   })

   it("Should return the correct decimal", () => {
      const result = Price.fromWholeAndCents(3, 0)
      expect(result).toStrictEqual(new Decimal(3))
   })

   it("Should return the correct decimal", () => {
      const result = Price.fromWholeAndCents(3, 1)
      expect(result).toStrictEqual(new Decimal(3.01))
   })
})
