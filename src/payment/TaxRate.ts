import Decimal from "decimal.js"

function getName(taxRate: Decimal): string {
   return `${taxRate.toString()}%`
}

export const taxRateQuery = {
   getName,
}
