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

function create(payee: Payee): Payee {
   return payee
}

const Payee = {
   create,
}

export type { Payee }
