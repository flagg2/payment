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

/**
 * A class which can handle stripe webhooks
 */
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

   /**
    * Register a handler for a specific event. You can register multiple handlers for the same event.
    *
    * @param event The event to register the handler for
    * @param handler The handler to register
    */

   public on<T extends keyof StripeEventType>(
      event: T,
      handler: StripeEventType[T],
   ): void | Promise<void> {
      const handlers: StripeEventType[T][] = this.handlers[event] ?? []
      handlers.push(handler)
      this.handlers[event] = handlers
   }
}

/**
 * Create a new stripe webhook handler, which can listen for webhook events from stripe.
 * The handler is not yet tested and might not work.
 *
 * @param params The parameters to create the handler with
 * @param params.client The stripe api client
 * @param params.expressApp The express application which is going to handle the webhook
 * @param params.apiEndpoint The endpoint to listen for webhooks on
 * @param params.webhookSecret The secret to use to verify the webhook
 * @returns The webhook handler
 */

function createStripeWebhookHandler(
   params: WebhookHandlerParams,
): StripeWebhookHandler {
   return new StripeWebhookHandler(params)
}

export const StripeWebhook = {
   createHandler: createStripeWebhookHandler,
}
