import { Payment } from "../payment/Payment"
import { AsyncResult, Result } from "@flagg2/result"
import { Stripe as StripeSdk } from "stripe"
import { getLineItems } from "./lineItems"

type StripeCheckoutSession = StripeSdk.Checkout.Session

/**
 * Create a new stripe checkout session
 * @link https://stripe.com/docs/api/checkout/sessions/create
 *
 * @param client The stripe api client
 * @param payment The payment to create the checkout session from
 * @param urls The urls to redirect to after the payment is completed or canceled
 * @returns A `Result` object containing either the checkout session or an error
 */

export async function create(
   client: StripeSdk,
   payment: Payment,
   urls: {
      success: string
      cancel: string
   },
): AsyncResult<StripeCheckoutSession> {
   const lineItems = await getLineItems(client, payment)
   if (lineItems.isErr()) {
      return Result.err(lineItems.error)
   }

   const { success, cancel } = urls

   const session = await Result.from(
      client.checkout.sessions.create({
         payment_method_types: ["card"],
         mode: "payment",
         line_items: lineItems.value,
         success_url: success,
         cancel_url: cancel,
      }),
   )
   if (session.isErr()) {
      return Result.err(session.error)
   }
   return Result.ok(session.value)
}

/**
 * Find a stripe checkout session by id
 * @link https://stripe.com/docs/api/checkout/sessions
 *
 * @param client The stripe api client
 * @param id The id of the checkout session
 * @returns A `Result` object containing either the checkout session or an error
 */

export async function findById(
   client: StripeSdk,
   id: string,
): AsyncResult<StripeCheckoutSession> {
   const session = await Result.from(client.checkout.sessions.retrieve(id))
   if (session.isErr()) {
      return Result.err(session.error)
   }
   return Result.ok(session.value)
}

/**
 * Expire a stripe checkout session
 * @link https://stripe.com/docs/api/checkout/sessions/expire
 *
 * @param client The stripe api client
 * @param id The id of the checkout session
 * @returns A `Result` object containing either the checkout session or an error
 */

export async function expire(
   client: StripeSdk,
   id: string,
): AsyncResult<StripeCheckoutSession> {
   const session = await Result.from(client.checkout.sessions.expire(id))
   if (session.isErr()) {
      return Result.err(session.error)
   }
   return Result.ok(session.value)
}

const StripeCheckoutSession = {
   create,
   findById,
   expire,
}

export { StripeCheckoutSession }