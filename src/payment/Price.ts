import Decimal from "decimal.js"
import { positiveDecimal } from "../common/decimal"
import { z } from "zod"
import { Currency } from "../common/currency"

/**
 * Round a price to a given precision
 *
 * @param price The price to round
 * @param precision The precision to round to
 * @returns The rounded price
 */

function roundTo(price: Decimal, precision: "whole" | "cents"): Decimal {
   if (precision === "whole") {
      return price.round()
   }
   return price.times(100).round().dividedBy(100)
}

/**
 * Separate a price into whole and cents, rounding the cents
 *
 * @param price The price to separate into whole and cents
 * @returns An object containing the whole and cents of the price
 */

function asWholeAndCents(price: Decimal): {
   whole: Decimal
   cents: Decimal
} {
   const whole = price.lessThan(0) ? price.ceil() : price.floor()
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

/**
 * Create a decimal from a number
 *
 * @param price The number to create a decimal from
 * @returns A decimal created from the number
 */

function fromNumber(price: number): Decimal {
   return new Decimal(price)
}

/**
 * Convert a price to cents
 *
 * @param price The price to convert to cents
 * @returns The price in cents
 */

function toCents(price: Decimal): Decimal {
   return price.times(100)
}

/**
 * Get a price in format of `${whole.cents} ${currency}`
 *
 * @param price The price to format
 * @param currency The currency to use
 * @returns The formatted price
 */

function getFormatted(price: Decimal, currency: Currency): string {
   if (price.lessThan(0)) {
      return `-${getFormatted(price.abs(), currency)}`
   }
   const split = asWholeAndCents(price)
   return `${split.whole.toString()}.${split.cents
      .toString()
      .padEnd(2, "0")} ${getCurrencyString(currency)}`
}

/**
 * Create a decimal from whole and cents
 *
 * @param whole The whole part of the price
 * @param cents The cents part of the price
 * @returns A decimal created from whole and cents
 */

function fromWholeAndCents(whole: number, cents: number): Decimal {
   return new Decimal(whole).plus(new Decimal(cents).dividedBy(100))
}

function create(price: Decimal): Price {
   return price
}

const schema = positiveDecimal

type Price = z.infer<typeof schema>

const Price = {
   getFormatted,
   roundTo,
   asWholeAndCents,
   toCents,
   fromNumber,
   fromWholeAndCents,
   create,
   getSchema: () => schema,
}

export { Price }
