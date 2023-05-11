import { it, expect, describe } from "vitest"
import { priceQuery, priceMutation } from "../../payment/Price"

describe("Price - getAsCents", () => {
   it("Should return the correct amount of cents", () => {
      const price = {
         whole: 3,
         cents: 99,
      }
      const result = priceQuery.getAsCents(price)
      expect(result).toBe(399)
   })

   it("Should round down", () => {
      const price = {
         whole: 3,
         cents: 50.4,
      }
      const result = priceQuery.getAsCents(price)
      expect(result).toBe(350)
   })

   it("Should round up", () => {
      const price = {
         whole: 3,
         cents: 50.5,
      }
      const result = priceQuery.getAsCents(price)
      expect(result).toBe(351)
   })
})

describe("Price - fromCents", () => {
   it("Should return the correct price", () => {
      const result = priceMutation.fromCents(399)
      expect(result).toEqual({
         whole: 3,
         cents: 99,
      })
   })

   it("Should round down", () => {
      const result = priceMutation.fromCents(350.4)
      expect(result).toEqual({
         whole: 3,
         cents: 50,
      })
   })

   it("Should round up", () => {
      const result = priceMutation.fromCents(350.5)
      expect(result).toEqual({
         whole: 3,
         cents: 51,
      })
   })
})
