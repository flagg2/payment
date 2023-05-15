import { Address } from "../common"

type Payee = {
   name: string
   billingInfo: Address
   companyInfo: {
      businessId: string
      taxId?: string
      vatId?: string
   }
}


export type { Payee }
