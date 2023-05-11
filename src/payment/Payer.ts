import { Address } from "../common"

type Payer = {
   name: string
   billingInfo: Address
   shippingInfo?: Address
   companyInfo?: {
      businessId: string
      taxId?: string
      vatId?: string
   }
}

export type { Payer }
