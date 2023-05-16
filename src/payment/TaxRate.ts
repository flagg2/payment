import Decimal from "decimal.js"

function getDisplayName(taxRate: Decimal): string {
   return `${taxRate.toString()}%`
}

type TaxRate = Decimal
const TaxRate = {
   getDisplayName,
}

export { TaxRate }
