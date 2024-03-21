import { z } from "zod"
import { Address } from "../common/address"
import { CompanyInfo } from "../common/companyInfo"

type Payee = z.infer<typeof schema>

const schema = z.object({
   name: z.string().nonempty(),
   billingInfo: Address.getSchema(),
   companyInfo: CompanyInfo.getSchema(),
})

function create(payee: Payee): Payee {
   return payee
}

const Payee = {
   create,
   getSchema: () => schema,
}

export { Payee }
