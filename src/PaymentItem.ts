import { DeepReadonly } from "@flagg2/ts-util"
import { ITaxRate } from "./TaxRate"

type Currency = "EUR" | "USD" | "CZK"

type IPrice<T extends Currency> = {
   currency: T
   whole: number
   fraction: number
}

type IPaymentItem<T extends Currency> = {
   name: string
   price: IPrice<T>
   taxRate: ITaxRate
   description?: string
   imageUrl?: string
}

type IPaymentItemWithOptionalTaxRate<T extends Currency> = {
   name: string
   price: IPrice<T>
   taxRate?: ITaxRate
   description?: string
   imageUrl?: string
}

function totalInCents(price: IPrice<Currency>): number {
   return price.whole * 100 + price.fraction
}

export { totalInCents }
export type { Currency, IPrice, IPaymentItem, IPaymentItemWithOptionalTaxRate }
