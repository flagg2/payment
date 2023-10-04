import { beforeAll, describe, expect, it } from "vitest"
import dotenv from "dotenv"
import express from "express"
import { StripeWebhook } from "../../stripe/WebhookHandler"
import { StripeClient } from "../../stripe/Client"
import { Result } from "@flagg2/result"

beforeAll(() => {
   dotenv.config({ path: ".env.test" })
})

function sleep(ms: number) {
   return new Promise((resolve) => setTimeout(resolve, ms))
}

// NOTE: for this to work stripe cli has to be running and forwarding events to
// http://localhost:3001/stripe/webhook and checkout session completed event has to be triggered
describe("Stripe webhook", async () => {
   it.skip(
      "Should handle a checkout session completed event",
      async () => {
         const expressApp = express()

         // expressApp.post("/payments/webhook", async (req, res) => {
         //    console.warn("Received webhook")

         //    res.sendStatus(200)
         // })

         expressApp.listen(3001, () => {
            console.log("Listening on port 3001")
         })

         const client = StripeClient.create(process.env.STRIPE_PRIVATE_KEY!)

         const webhook = StripeWebhook.createHandler({
            apiEndpoint: "/payments/webhook",
            client,
            expressApp,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
         })

         let called = false

         webhook.on("checkout.session.completed", async (session) => {
            console.log("Checkout session completed", session)
            called = true
            return Result.ok(null)
         })

         await sleep(10000)

         expect(called).toBe(true)
      },
      { timeout: 30000 },
   )
})
