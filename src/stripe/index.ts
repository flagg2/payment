import { Stripe as StripeSdkImport } from "stripe"
import { createCheckoutSession } from "./checkoutSession"

type StripeSdk = StripeSdkImport

function createStripeSdk(privateKey: string): StripeSdk {
   return new StripeSdkImport(privateKey, {
      apiVersion: "2022-11-15",
   })
}
const StripeSdk = {
   create: createStripeSdk,
   createCheckoutSession,
}

export { StripeSdk }
