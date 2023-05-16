import Decimal from "decimal.js"
import { Currency } from "../common"

function roundTo(price: Decimal, precision: "whole" | "cents"): Decimal {
   if (precision === "whole") {
      return price.round()
   }
   return price.times(100).round().dividedBy(100)
}

function asWholeAndCents(price: Decimal): {
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

function fromNumber(price: number): Decimal {
   return new Decimal(price)
}

function toCents(price: Decimal): Decimal {
   return price.times(100)
}

function getFormatted(price: Decimal, currency: Currency): string {
   const split = asWholeAndCents(price)
   return `${split.whole.toString()}.${split.cents.toString()} ${getCurrencyString(
      currency,
   )}`
}

type Price = Decimal

const Price = {
   getFormatted,
   roundTo,
   asWholeAndCents,
   toCents,
   fromNumber,
}

export { Price }
