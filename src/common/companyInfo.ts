import { z } from "zod"

const companyInfoSchema = z.object({
   businessId: z.string().nonempty(),
   taxId: z.string().optional(),
   vatId: z.string().optional(),
})

type CompanyInfo = z.infer<typeof companyInfoSchema>

const CompanyInfo = {
   getSchema: () => companyInfoSchema,
}

export { CompanyInfo }
