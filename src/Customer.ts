import { DeepReadonly } from "@flagg2/ts-util"

type ICustomer = DeepReadonly<{
   name: string
   billingInfo: {
      address: string
      city: string
      zip: string
      country: string
   }
   shippingInfo?: {
      address: string
      city: string
      zip: string
      country: string
   }
}>

function createCustomer(params: ICustomer): ICustomer {
   return params
}

export { createCustomer }
export type { ICustomer }
