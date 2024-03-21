// import { StripeClient } from "./Client"
// import express, { Application } from "express"
// import { Stripe } from "stripe"
// import { Buffer } from "buffer"
// import { AsyncResult, Result } from "@flagg2/result"
// import asyncHandler from "express-async-handler"

// // TODO: this stripe logic needs rewriting, but is not necessary right now

// type StripeWebhook = {
//    client: StripeClient
//    express: Application
//    apiEndpoint: string
//    webhookSecret: string
// }

// // @ts-expect-error dumb
// interface CheckoutSessionEvent extends Stripe.Event {
//    data: {
//       object: Stripe.Checkout.Session
//    }
// }

// const knownEventTypes = [
//    "checkout.session.completed",
//    "checkout.session.expired",
// ] as const

// type StripeEventError = {
//    status: number
//    message: string
//    data?: any
// }

// type StripeEventResult = Result<any, StripeEventError>

// type StripeEventResultPromise = Promise<StripeEventResult>

// type StripeEventType = {
//    "checkout.session.completed": (
//       event: CheckoutSessionEvent,
//    ) => StripeEventResultPromise
//    "checkout.session.expired": (
//       event: CheckoutSessionEvent,
//    ) => StripeEventResultPromise
// }

// function isKnownEventType(type: string): type is keyof StripeEventType {
//    // @ts-expect-error dumb ts
//    return knownEventTypes.includes(type)
// }

// type StripeEventMap = {
//    [key in keyof StripeEventType]?: StripeEventType[key][]
// }

// type WebhookHandlerParams = {
//    client: StripeClient
//    expressApp: Application
//    apiEndpoint: string
//    webhookSecret: string
// }

// /**
//  * A class which can handle stripe webhooks
//  */
// class StripeWebhookHandler {
//    private readonly client: StripeClient
//    private readonly expressApp: Application
//    private handlers: StripeEventMap = {}

//    public constructor(params: WebhookHandlerParams) {
//       const { client, expressApp, apiEndpoint, webhookSecret } = params
//       this.client = client
//       this.expressApp = expressApp
//       this.expressApp.post(
//          apiEndpoint,
//          express.raw({ type: "application/json" }),
//          asyncHandler(async (req, res) => {
//             // @ts-expect-error this is here only to make @flagg2/brisk work and should be removed in the future
//             if (req.rawBody !== undefined) {
//                // @ts-expect-error ^^^
//                req.body = req.rawBody
//             }
//             const sig = req.headers["stripe-signature"]
//             if (
//                sig === undefined ||
//                !webhookSecret ||
//                (!(req.body instanceof Buffer) &&
//                   !(typeof req.body === "string"))
//             ) {
//                res.sendStatus(400)
//                return
//             }
//             const event = this.client.webhooks.constructEvent(
//                req.body,
//                sig,
//                webhookSecret,
//             )

//             if (
//                !isKnownEventType(event.type) ||
//                this.handlers[event.type] === undefined
//             ) {
//                res.status(200).send({
//                   message: "No handler for this event",
//                })
//                return
//             }

//             console.log("Received event", event)

//             const handlers = this.handlers[event.type]!
//             const resultsP: StripeEventResultPromise[] = []

//             for (const handler of handlers) {
//                resultsP.push(handler(event as CheckoutSessionEvent))
//             }

//             const results = await Promise.all(resultsP)
//             const errors: StripeEventError[] = []

//             for (const result of results) {
//                if (result.isErr()) {
//                   errors.push(result.errValue)
//                }
//             }

//             if (errors.length > 0) {
//                let { status } = errors[0]!
//                if (errors.some((error) => error.status !== status)) {
//                   status = 500
//                }

//                res.status(status).send({
//                   errors,
//                })
//                return
//             }

//             res.status(200).send({
//                results: results.map((result) => result.unwrap() as unknown),
//             })
//          }),
//       )
//    }

//    /**
//     * Register a handler for a specific event. You can register multiple handlers for the same event.
//     *
//     * @param event The event to register the handler for
//     * @param handler The handler to register
//     */

//    public on<T extends keyof StripeEventType>(
//       event: T,
//       handler: StripeEventType[T],
//    ): void {
//       const handlers: StripeEventType[T][] = this.handlers[event] ?? []
//       handlers.push(handler)
//       this.handlers[event] = handlers
//    }
// }

// /**
//  * Create a new stripe webhook handler, which can listen for webhook events from stripe.
//  * The handler is not yet tested and might not work.
//  *
//  * @param params The parameters to create the handler with
//  * @param params.client The stripe api client
//  * @param params.expressApp The express application which is going to handle the webhook
//  * @param params.apiEndpoint The endpoint to listen for webhooks on
//  * @param params.webhookSecret The secret to use to verify the webhook
//  * @returns The webhook handler
//  */

// function createStripeWebhookHandler(
//    params: WebhookHandlerParams,
// ): StripeWebhookHandler {
//    return new StripeWebhookHandler(params)
// }

// export const StripeWebhook = {
//    createHandler: createStripeWebhookHandler,
// }
