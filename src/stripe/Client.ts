import { Stripe as StripeClientImport } from "stripe"

type StripeClient = StripeClientImport

function createStripeClient(privateKey: string): StripeClient {
   return new StripeClientImport(privateKey, {
      apiVersion: "2022-11-15",
   })
}
const StripeClient = {
   create: createStripeClient,
}

export { StripeClient }
