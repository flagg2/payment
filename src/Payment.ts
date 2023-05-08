import { DeepReadonly, deepReadonly } from "@flagg2/ts-util"
import {
   Currency,
   IPaymentItem,
   IPaymentItemWithOptionalTaxRate,
   IPrice,
} from "./PaymentItem"
import { ITaxRate } from "./TaxRate"

class Payment<TCurrency extends Currency> {
   public readonly currency: TCurrency
   public readonly defaultTaxRate: ITaxRate
   private readonly _items = new Map<IPaymentItem<TCurrency>, number>()

   public constructor(params: PaymentOptions<TCurrency>) {
      const { currency, defaultTaxRate } = params
      this.currency = currency
      this.defaultTaxRate = defaultTaxRate
      this._items = new Map()
      for (const [item, quantity] of params.items) {
         this._items.set(
            {
               ...item,
               taxRate: item.taxRate ?? defaultTaxRate,
            },
            quantity,
         )
      }
   }

   public get items(): DeepReadonly<Map<IPaymentItem<TCurrency>, number>> {
      return deepReadonly(this._items)
   }

   public getTaxRates(): ReadonlySet<ITaxRate> {
      const taxRates = new Set<ITaxRate>()
      for (const [item] of this.items) {
         taxRates.add(item.taxRate)
      }
      return taxRates
   }

   public getTotalPrice(): IPrice<TCurrency> {
      const totalPrice: IPrice<TCurrency> = {
         currency: this.currency,
         whole: 0,
         fraction: 0,
      }
      for (const [item, quantity] of this.items) {
         totalPrice.whole += item.price.whole * quantity
         totalPrice.fraction += item.price.fraction * quantity
      }
      return totalPrice
   }
}

type PaymentOptions<TCurrency extends Currency> = Omit<
   IPayment<TCurrency>,
   "items"
> & {
   items:
      | Map<IPaymentItemWithOptionalTaxRate<TCurrency>, number>
      | ReadonlyMap<IPaymentItemWithOptionalTaxRate<TCurrency>, number>
}

type IPayment<TCurrency extends Currency> = {
   items: DeepReadonly<Map<IPaymentItem<TCurrency>, number>>
   defaultTaxRate: ITaxRate
   currency: TCurrency
}

function createPayment<TCurrency extends Currency>(
   params: PaymentOptions<TCurrency>,
): Payment<TCurrency> {
   return new Payment(params)
}

export type { Payment, IPayment }
export { createPayment }
