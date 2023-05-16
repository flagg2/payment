import Decimal from "decimal.js"

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

type TaxRate = Decimal
const TaxRate = {
   getDisplayName,
}

export { TaxRate }
