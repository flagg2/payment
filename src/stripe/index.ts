import { Stripe as StripeSdkImport } from "stripe"
import { createCheckoutSession } from "./checkoutSession"

type Stripe = StripeSdkImport

function createStripeSdk(privateKey: string): Stripe {
   return new StripeSdkImport(privateKey, {
      apiVersion: "2022-11-15",
   })
}
const Stripe = {
   create: createStripeSdk,
   createCheckoutSession,
}

export { Stripe }
