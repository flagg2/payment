import Decimal from "decimal.js"
import { positiveDecimal } from "../common/decimal"
import { z } from "zod"

/**
 * Get the display name of a tax rate to be used in invoices and payment services.
 *
 * @param taxRate - The tax rate to get the display name from.
 * @param opts - Options for the display name.
 * @param opts.includePrefix - Whether to include the "DPH" prefix in the display name.
 * @returns The display name of the tax rate.
 *
 */

function getDisplayName(
   taxRate: Decimal,
   opts?: {
      includePrefix?: boolean
   },
): string {
   const { includePrefix } = opts ?? {}
   if (includePrefix) {
      return `DPH ${taxRate.toString()}%`
   }
   return `${taxRate.toString()}%`
}

function create(taxRate: Decimal): TaxRate {
   return taxRate
}

const schema = positiveDecimal

type TaxRate = z.infer<typeof schema>
const TaxRate = {
   getDisplayName,
   create,
   getSchema: () => schema,
}

export { TaxRate }
