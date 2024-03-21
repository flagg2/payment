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
   locale?: StripeSdk.Checkout.SessionCreateParams.Locale,
) {
   const lineItems = await getLineItems(client, payment)
   if (lineItems.isErr()) {
      return lineItems
   }

   const { success, cancel } = urls

   return Result.from(
      client.checkout.sessions.create({
         payment_method_types: ["card"],
         mode: "payment",
         line_items: lineItems.value,
         success_url: success,
         cancel_url: cancel,
         locale,
      }),
      () => "CHECKOUT_SESSION_CREATION_FAILED",
   )
}

/**
 * Find a stripe checkout session by id
 * @link https://stripe.com/docs/api/checkout/sessions
 *
 * @param client The stripe api client
 * @param id The id of the checkout session
 * @returns A `Result` object containing either the checkout session or an error
 */

export async function findById(client: StripeSdk, id: string) {
   return Result.from(
      client.checkout.sessions.retrieve(id),
      () => "CHECKOUT_SESSION_FETCH_FAILED",
   )
}

/**
 * Expire a stripe checkout session
 * @link https://stripe.com/docs/api/checkout/sessions/expire
 *
 * @param client The stripe api client
 * @param id The id of the checkout session
 * @returns A `Result` object containing either the checkout session or an error
 */

export async function expire(client: StripeSdk, id: string) {
   return Result.from(
      client.checkout.sessions.expire(id),
      () => "CHECKOUT_SESSION_EXPIRE_FAILED",
   )
}

const StripeCheckoutSession = {
   create,
   findById,
   expire,
}

export { StripeCheckoutSession }
