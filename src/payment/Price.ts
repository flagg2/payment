import Decimal from "decimal.js"
import { Currency } from "../common"

function roundTo(price: Price, precision: "whole" | "cents"): Price {
   if (precision === "whole") {
      return price.round()
   }
   return price.times(100).round().dividedBy(100)
}

function asWholeAndCents(price: Price): {
   whole: Decimal
   cents: Decimal
} {
   const whole = price.floor()
   const cents = price.minus(whole).times(100).round()
   return { whole, cents }
}

function getCurrencyString(currency: Currency): string {
   switch (currency) {
      case "CZK":
         return "Kč"
      case "EUR":
         return "€"
      case "USD":
         return "$"
   }
}

function fromNumber(price: number): Price {
   return new Decimal(price)
}

function toCents(price: Price): Price {
   return price.times(100)
}

function getFormatted(price: Price, currency: Currency): string {
   const split = asWholeAndCents(price)
   return `${split.whole.toString()}.${split.cents.toString()} ${getCurrencyString(
      currency,
   )}`
}

type Price = Decimal

export type { Price }
export const priceQuery = {
   getFormatted,
   roundTo,
   asWholeAndCents,
   toCents,
}
export const priceMutation = {
   fromNumber,
}
