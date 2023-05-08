import { IPayment, createPayment } from "./Payment"
import { Currency, totalInCents } from "./PaymentItem"
import { AsyncResult, Result } from "@flagg2/result"
import { Stripe as StripeSdk } from "stripe"
import { ITaxRate } from "./TaxRate"

type StripeCheckoutSession = StripeSdk.Checkout.Session
type StripeLineItem = StripeSdk.Checkout.SessionCreateParams.LineItem
type StripeTaxRate = StripeSdk.TaxRate
type StripeSecrets = {
   privateKey: string
   publicKey: string
   webhookSecret: string
}
type StripeUrls = {
   successUrl: string
   cancelUrl: string
}

class Stripe {
   public readonly secrets: StripeSecrets
   public readonly urls: StripeUrls
   private readonly api: StripeSdk

   public constructor(config: { secrets: StripeSecrets; urls: StripeUrls }) {
      const { secrets, urls } = config
      this.secrets = secrets
      this.urls = urls
      this.api = new StripeSdk(secrets.privateKey, {
         apiVersion: "2022-11-15",
      })
   }

   public async createCheckoutSession(
      payment: IPayment<Currency>,
   ): AsyncResult<StripeCheckoutSession> {
      const lineItems = await this.getLineItems(payment)
      if (lineItems.isErr()) {
         return Result.err(lineItems.error)
      }
      const session = await Result.from(
         this.api.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: lineItems.value,
            success_url: this.urls.successUrl,
            cancel_url: this.urls.successUrl,
         }),
      )
      if (session.isErr()) {
         return Result.err(session.error)
      }
      return Result.ok(session.value)
   }

   // TODO: test this
   private async takeWhileHasMore<T extends object>(
      apiFn: (...args: any[]) => Promise<{
         data: T[]
         next_page?: string
         has_more: boolean
      }>,
   ): AsyncResult<T[]> {
      const result: T[] = []
      let hasNext = true
      let lastResult = apiFn()
      while (hasNext) {
         const res = await Result.from(lastResult)
         if (res.isErr()) {
            return Result.err(res.error)
         }
         const { data, has_more, next_page } = res.value
         result.push(...data)
         hasNext = has_more
         if (hasNext) {
            lastResult = apiFn({ page: next_page })
         }
      }
      return Result.ok(result)
   }

   private async createMissingTaxRates(
      missing: ITaxRate[],
   ): AsyncResult<StripeTaxRate[]> {
      const createdTaxRates = await Result.from(
         Promise.all(
            missing.map((rate) =>
               this.api.taxRates.create({
                  display_name: rate.name,
                  inclusive: rate.type === "inclusive",
                  percentage: rate.rate,
               }),
            ),
         ),
      )
      if (createdTaxRates.isErr()) {
         return Result.err(createdTaxRates.error)
      }
      return Result.ok(createdTaxRates.value)
   }

   private async getTaxRateMap(
      payment: IPayment<Currency>,
   ): AsyncResult<ReadonlyMap<ITaxRate, StripeTaxRate>> {
      const taxRateMap = new Map<ITaxRate, StripeTaxRate>()
      const allRates = await this.takeWhileHasMore(() =>
         this.api.taxRates.list({ limit: 100 }),
      )
      if (allRates.isErr()) {
         return Result.err(allRates.error)
      }
      const existingTaxRates = allRates.value.filter((rate) => rate.active)

      const taxRatesOfPayment = createPayment(payment).getTaxRates()
      const toBeCreated: ITaxRate[] = []

      for (const paymentTaxRate of taxRatesOfPayment) {
         const existingTaxRate = existingTaxRates.find(
            (rate) =>
               rate.percentage === paymentTaxRate.rate &&
               rate.display_name === paymentTaxRate.name &&
               rate.inclusive === (paymentTaxRate.type === "inclusive"),
         )

         if (existingTaxRate) {
            taxRateMap.set(paymentTaxRate, existingTaxRate)
         } else {
            toBeCreated.push(paymentTaxRate)
         }
      }

      const createdTaxRates = await this.createMissingTaxRates(toBeCreated)
      if (createdTaxRates.isErr()) {
         return Result.err(createdTaxRates.error)
      }

      for (const createdTaxRate of createdTaxRates.value) {
         const paymentTaxRate = toBeCreated.find(
            (rate) =>
               rate.rate === createdTaxRate.percentage &&
               rate.name === createdTaxRate.display_name &&
               rate.type ===
                  (createdTaxRate.inclusive ? "inclusive" : "exclusive"),
         )
         if (paymentTaxRate) {
            taxRateMap.set(paymentTaxRate, createdTaxRate)
         } else {
            return Result.err(new Error("Created tax rate not found"))
         }
      }

      return Result.ok(taxRateMap)
   }

   private async getLineItems(
      payment: IPayment<Currency>,
   ): AsyncResult<StripeLineItem[]> {
      const taxRateMap = await this.getTaxRateMap(payment)
      if (taxRateMap.isErr()) {
         return Result.err(taxRateMap.error)
      }
      const items = payment.items
      const lineItems: StripeLineItem[] = []
      for (const [item, quantity] of items.entries()) {
         const taxRate = taxRateMap.value.get(item.taxRate)
         if (taxRate === undefined) {
            return Result.err(new Error("Tax rate not found"))
         }
         lineItems.push({
            quantity,
            tax_rates: [taxRate.id],
            price_data: {
               currency: payment.currency,
               unit_amount: totalInCents(item.price),
               product_data: {
                  name: item.name,
                  description: item.description,
                  ...(item.imageUrl !== undefined && {
                     images: [item.imageUrl],
                  }),
               },
            },
         })
      }

      return Result.ok(lineItems)
   }
}

export function createStripe(config: {
   secrets: StripeSecrets
   urls: StripeUrls
}): Stripe {
   return new Stripe(config)
}

export type { Stripe }
