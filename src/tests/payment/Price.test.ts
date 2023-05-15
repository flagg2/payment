import { it, expect, describe } from "vitest"
import { priceQuery, priceMutation } from "../../payment/Price"
import Decimal from "decimal.js"

describe("Price - asWholeAndCents", () => {
   it("Should return the correct amount of cents", () => {
      const price = new Decimal(3.99)
      const result = priceQuery.asWholeAndCents(price)
      expect(result).toStrictEqual({
         whole: new Decimal(3),
         cents: new Decimal(99),
      })
   })

   it("Should round down", () => {
      const price = new Decimal(3.504)
      const result = priceQuery.asWholeAndCents(price)
      expect(result).toStrictEqual({
         whole: new Decimal(3),
         cents: new Decimal(50),
      })
   })

   it("Should round up", () => {
      const price = new Decimal(3.505)
      const result = priceQuery.asWholeAndCents(price)
      expect(result).toStrictEqual({
         whole: new Decimal(3),
         cents: new Decimal(51),
      })
   })
})

describe("Price - roundTo ", () => {
   it("Should round to whole", () => {
      const price = new Decimal(3.99)
      const result = priceQuery.roundTo(price, "whole")
      expect(result).toStrictEqual(new Decimal(4))
   })

   it("Should round down to cents", () => {
      const price = new Decimal(3.992)
      const result = priceQuery.roundTo(price, "cents")
      expect(result).toStrictEqual(new Decimal(3.99))
   })

   it("Should round up to cents", () => {
      const price = new Decimal(3.985)
      const result = priceQuery.roundTo(price, "cents")
      expect(result).toStrictEqual(new Decimal(3.99))
   })
})

describe("Price - getFormatted", () => {
   it("Should return the correct formatted string", () => {
      const price = new Decimal(3.99)
      const result = priceQuery.getFormatted(price, "EUR")
      expect(result).toBe("3.99 €")
   })

   it("Should return the correct formatted string", () => {
      const price = new Decimal(3.985)
      const result = priceQuery.getFormatted(price, "USD")
      expect(result).toBe("3.99 $")
   })

   it("Should return the correct formatted string", () => {
      const price = new Decimal(3.532)
      const result = priceQuery.getFormatted(price, "CZK")
      expect(result).toBe("3.53 Kč")
   })
})
