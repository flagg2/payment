import { Stripe as StripeSdk } from "stripe"
import { createCheckoutSession } from "./checkoutSession"

function createStripeSdk(privateKey: string): StripeSdk {
   return new StripeSdk(privateKey, {
      apiVersion: "2022-11-15",
   })
}

export const stripeMutation = {
   createStripeSdk,
   createCheckoutSession,
}

export type { StripeSdk }
