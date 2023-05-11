import { describe, expect, it } from "vitest"
import { Payer, payerQuery } from "../../payment/Payer"

function payerWithVat(vat: string): Payer {
   return {
      billingInfo: {
         city: "Bratislava",
         country: "Slovakia",
         zip: "82108",
         street: "Karlova Ves 123",
      },
      name: "John Doe",
      companyInfo: {
         businessId: "2020382056",
         vatId: vat,
      },
   }
}

describe("Check VAT", () => {
   it("Should pass with valid VAT", async () => {
      const VAT = "SK2020382056"
      const isValid = await payerQuery.hasValidVat(payerWithVat(VAT))
      expect(isValid.isErr()).toBe(false)
      if (isValid.isOk()) {
         expect(isValid.value).toBe(true)
      }
   })

   it("Should pass with foreign VAT", async () => {
      const VAT = "FR63382357721" // psg vat
      const isValid = await payerQuery.hasValidVat(payerWithVat(VAT))
      console.log(isValid)
      expect(isValid.isErr()).toBe(false)
      if (isValid.isOk()) {
         expect(isValid.value).toBe(true)
      }
   })

   it("Should fail without prefix", async () => {
      const VAT = "2020382056"
      const isValid = await payerQuery.hasValidVat(payerWithVat(VAT))
      expect(isValid.isErr()).toBe(false)
      if (isValid.isOk()) {
         expect(isValid.value).toBe(false)
      }
   })

   it("Should fail with invalid VAT", async () => {
      const VAT = "SK2020382057"
      const isValid = await payerQuery.hasValidVat(payerWithVat(VAT))
      expect(isValid.isErr()).toBe(false)
      if (isValid.isOk()) {
         expect(isValid.value).toBe(false)
      }
   })
})
