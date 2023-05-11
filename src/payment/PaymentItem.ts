import { TaxRate } from "./TaxRate"

function getTotalInCents(item: PaymentItem): number {
   const { price } = item
   return price.whole * 100 + price.decimal
}

type Price = {
   whole: number
   decimal: number
}

type PaymentItem = {
   name: string
   price: Price
   taxRate: TaxRate
   description?: string
   imageUrl?: string
}

export type { Price, PaymentItem }
export const paymentItemQuery = {
   getTotalInCents,
}
