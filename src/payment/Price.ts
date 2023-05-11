import Decimal from "decimal.js"

function getAsCents(
   price: Price,
   opts?: {
      roundCents?: boolean
   },
): number {
   const { roundCents = true } = opts ?? {}
   const whole = new Decimal(Math.round(price.whole))
   const cents = new Decimal(roundCents ? Math.round(price.cents) : price.cents)
   return whole.times(100).plus(cents).toNumber()
}

function fromCents(
   cents: number,
   opts?: {
      roundCents?: boolean
   },
): Price {
   const { roundCents = true } = opts ?? {}
   const decimalCents = new Decimal(roundCents ? Math.round(cents) : cents)
   return {
      whole: decimalCents.dividedBy(100).floor().toNumber(),
      cents: decimalCents.modulo(100).toNumber(),
   }
}

type Price = {
   whole: number
   cents: number
}

export type { Price }
export const priceQuery = {
   getAsCents,
}
export const priceMutation = {
   fromCents,
}
