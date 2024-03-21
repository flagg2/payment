import { z } from "zod"

const schema = z.enum(["EUR", "USD", "CZK"])

type Currency = z.infer<typeof schema>

const Currency = {
   getSchema: () => schema,
}

export { Currency }
