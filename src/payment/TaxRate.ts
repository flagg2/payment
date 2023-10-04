import Decimal from "decimal.js"

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

type TaxRate = Decimal
const TaxRate = {
   getDisplayName,
   create,
}

export { TaxRate }
