import { z } from "zod"

type Address = {
   street: string
   city: string
   zip: string
   country: string
}

const addressSchema = z.object({
   street: z.string().nonempty(),
   city: z.string().nonempty(),
   zip: z.string().nonempty(),
   country: z.string().nonempty(),
})

const Address = {
   getSchema: () => addressSchema,
}

export { Address }
