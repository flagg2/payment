import { it, expect, beforeAll, describe, beforeEach } from "vitest"
import { StripeClient } from "../../stripe/Client"
import dotenv from "dotenv"
import { Payment } from "../../payment/Payment"
import Decimal from "decimal.js"
import { PaymentItem } from "../../payment/PaymentItem"
import { StripeCheckoutSession } from "../../stripe/CheckoutSession"

beforeAll(() => {
   dotenv.config({ path: ".env.test" })
})
describe("Stripe client", () => {
   it("Should create a stripe api client", async () => {
      const client = StripeClient.create(process.env.STRIPE_PRIVATE_KEY!)

      expect(client).toBeDefined()
      expect(client).toHaveProperty("customers")
      expect(client).toHaveProperty("products")
      expect(client).toHaveProperty("prices")

      expect(client.customers).toBeDefined()
      expect(client.products).toBeDefined()
      expect(client.prices).toBeDefined()

      expect(() => client.accounts.list()).not.toThrowError()
   })

   it("Should fail with an invalid private key", async () => {
      const invalid = StripeClient.create("invalid")
      expect(invalid.accounts.list()).rejects.toThrowError()
   })
})

describe("Stripe checkout session", () => {
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
   let client: StripeClient
   const urls = {
      success: "https://example.com/success",
      cancel: "https://example.com/cancel",
   }

   beforeAll(() => {
      client = StripeClient.create(process.env.STRIPE_PRIVATE_KEY!)
   })

   beforeEach(() => {
      payment1 = {
         currency: "EUR",
         items: new Map([]),
      }
      Payment.addItem(payment1, bigMac, new Decimal(1))
      Payment.addItem(payment1, fries, new Decimal(1))
   })

   it("Should create a checkout session", async () => {
      const session = await StripeCheckoutSession.create(client, payment1, urls)

      console.log(session)
      expect(session.isOk()).toBe(true)
      const value = session.unwrap()

      expect(value).toHaveProperty("id")
      expect(value).toHaveProperty("object")
      expect(value).toHaveProperty("payment_method_types")
      expect(value).toHaveProperty("mode")
      expect(value).toHaveProperty("success_url")
      expect(value.success_url).toBe(urls.success)
      expect(value).toHaveProperty("cancel_url")
      expect(value.cancel_url).toBe(urls.cancel)
      expect(value).toHaveProperty("url")

      expect(value.amount_total).toBe(743)
      expect(value.amount_subtotal).toBe(614)

      console.log(value.url)
   })

   it("Should create a session, then expire it", async () => {
      const session = await StripeCheckoutSession.create(client, payment1, urls)

      expect(session.isOk()).toBe(true)
      const value = session.unwrap()

      expect(value).toHaveProperty("id")
      expect(value).toHaveProperty("object")
      expect(value).toHaveProperty("payment_method_types")
      expect(value).toHaveProperty("mode")
      expect(value).toHaveProperty("success_url")
      expect(value.success_url).toBe(urls.success)
      expect(value).toHaveProperty("cancel_url")
      expect(value.cancel_url).toBe(urls.cancel)
      expect(value).toHaveProperty("url")

      expect(value.amount_total).toBe(743)
      expect(value.amount_subtotal).toBe(614)

      const sessionById = await StripeCheckoutSession.findById(client, value.id)
      expect(sessionById.isOk()).toBe(true)

      expect(sessionById.unwrap()).toStrictEqual(value)

      const expired = await StripeCheckoutSession.expire(client, value.id)
      expect(expired.isOk()).toBe(true)

      expect(expired.unwrap().status).toBe("expired")
   })
})
