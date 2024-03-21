import Decimal from "decimal.js"
import { z } from "zod"

export const positiveInteger = z.coerce
   .number()
   .int()
   .positive()
   .transform((value) => new Decimal(value))

export const positiveDecimal = z.coerce
   .number()
   .positive()
   .transform((value) => new Decimal(value))
