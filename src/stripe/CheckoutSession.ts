import { Payment } from "../payment/Payment"
import { AsyncResult, Result } from "@flagg2/result"
import { Stripe as StripeSdk } from "stripe"
import { getLineItems } from "./lineItems"

type StripeCheckoutSession = StripeSdk.Checkout.Session

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
