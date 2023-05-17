import { Stripe as StripeClientImport } from "stripe"

type StripeClient = StripeClientImport

/**
 * Create a new stripe api client
 *
 * @param privateKey The private key to use for the client
 * @returns The stripe api client
 */

function createStripeClient(privateKey: string): StripeClient {
   return new StripeClientImport(privateKey, {
      apiVersion: "2022-11-15",
   })
}
const StripeClient = {
   create: createStripeClient,
}

export { StripeClient }
