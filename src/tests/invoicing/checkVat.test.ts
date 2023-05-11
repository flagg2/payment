import { describe, expect, it } from "vitest"
import { isVatValid } from "../../invoicing/checkVat"

describe("Check VAT", () => {
   it("Should pass with valid VAT", async () => {
      const VAT = "SK2020382056"
      const isValid = await isVatValid(VAT)
      console.log(isValid)
      expect(isValid.isErr()).toBe(false)
      if (isValid.isOk()) {
         expect(isValid.value).toBe(true)
      }
   })

   it("Should pass with foreign VAT", async () => {
      const VAT = "FR63382357721" // psg vat
      const isValid = await isVatValid(VAT)
      console.log(isValid)
      expect(isValid.isErr()).toBe(false)
      if (isValid.isOk()) {
         expect(isValid.value).toBe(true)
      }
   })

   it("Should fail without prefix", async () => {
      const VAT = "2020382056"
      const isValid = await isVatValid(VAT)
      expect(isValid.isErr()).toBe(true)
      if (isValid.isOk()) {
         expect(isValid.value).toBe(false)
      }
   })

   it("Should fail with invalid VAT", async () => {
      const VAT = "SK2020382057"
      const isValid = await isVatValid(VAT)
      console.log(isValid)
      expect(isValid.isErr()).toBe(false)
      if (isValid.isOk()) {
         expect(isValid.value).toBe(false)
      }
   })
})
