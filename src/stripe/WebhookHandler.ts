import { StripeClient } from "./Client"
import express, { Application } from "express"
import { Stripe } from "stripe"
import { Buffer } from "buffer"

type StripeWebhook = {
   client: StripeClient
   express: Application
   apiEndpoint: string
   webhookSecret: string
}

interface CheckoutSessionEvent extends Stripe.Event {
   data: {
      object: Stripe.Checkout.Session
   }
}

const knownEventTypes = [
   "checkout.session.completed",
   "checkout.session.expired",
] as const

type StripeEventType = {
   "checkout.session.completed": (event: CheckoutSessionEvent) => void
   "checkout.session.expired": (event: CheckoutSessionEvent) => void
}

function isKnownEventType(type: string): type is keyof StripeEventType {
   return type in knownEventTypes
}

type StripeEventMap = {
   [key in keyof StripeEventType]?: StripeEventType[key][]
}

type WebhookHandlerParams = {
   client: StripeClient
   expressApp: Application
   apiEndpoint: string
   webhookSecret: string
}

class StripeWebhookHandler {
   private readonly client: StripeClient
   private readonly expressApp: Application
   private handlers: StripeEventMap = {}

   public constructor(params: WebhookHandlerParams) {
      const { client, expressApp, apiEndpoint, webhookSecret } = params
      this.client = client
      this.expressApp = expressApp
      this.expressApp.post(
         apiEndpoint,
         express.raw({ type: "application/json" }),
         (req, res) => {
            const sig = req.headers["stripe-signature"]
            if (
               sig === undefined ||
               !webhookSecret ||
               !(req.body instanceof Buffer)
            ) {
               res.sendStatus(400)
               return
            }
            const event = this.client.webhooks.constructEvent(
               req.body,
               sig,
               webhookSecret,
            )

            if (!isKnownEventType(event.type)) {
               res.sendStatus(200)
               return
            }

            const handlers = this.handlers[event.type]
            if (!handlers) {
               res.sendStatus(400)
               return
            }
            for (const handler of handlers) {
               // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
               handler(event as any)
            }
            res.sendStatus(200)
         },
      )
   }

   public on<T extends keyof StripeEventType>(
      event: T,
      handler: StripeEventType[T],
   ): void {
      const handlers: StripeEventType[T][] = this.handlers[event] ?? []
      handlers.push(handler)
      this.handlers[event] = handlers
   }
}

function createStripeWebhookHandler(
   params: WebhookHandlerParams,
): StripeWebhookHandler {
   return new StripeWebhookHandler(params)
}

export const StripeWebhook = {
   createHandler: createStripeWebhookHandler,
}
