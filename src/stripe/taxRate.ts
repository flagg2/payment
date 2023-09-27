import { Stripe as StripeSdk } from "stripe"
import { Payment } from "../payment/Payment"
import { AsyncResult, Result } from "@flagg2/result"
import Decimal from "decimal.js"
import { TaxRate } from "../payment/TaxRate"
import { takeWhileHasMore } from "./utils"
import { StructuralMap } from "@flagg2/data-structures"

type StripeTaxRate = StripeSdk.TaxRate

async function createMissingTaxRates(client: StripeSdk, toCreate: Decimal[]) {
   return Result.from(
      Promise.all(
         toCreate.map((rate) =>
            client.taxRates.create({
               display_name: TaxRate.getDisplayName(rate, {
                  includePrefix: true,
               }),
               inclusive: false,
               percentage: rate.toNumber(),
            }),
         ),
      ),
      "TAX_RATE_CREATION_FAILED",
   )
}

export async function getTaxRateMap(client: StripeSdk, payment: Payment) {
   // TODO: make readonly
   const taxRateMap = new StructuralMap<Decimal, StripeTaxRate>()
   const allRates = await takeWhileHasMore(() =>
      client.taxRates.list({ limit: 100 }),
   )
   if (allRates.isErr()) {
      return allRates.mapErr(() => "TAX_RATE_FETCH_FAILED" as const)
   }
   const existingTaxRates = allRates.value.filter((rate) => rate.active)

   const taxRatesOfPayment = Payment.getTaxRates(payment)
   const toBeCreated: Decimal[] = []

   for (const paymentTaxRate of taxRatesOfPayment) {
      const existingTaxRate = existingTaxRates.find(
         (rate) =>
            rate.percentage === paymentTaxRate.toNumber() &&
            rate.display_name ===
               TaxRate.getDisplayName(paymentTaxRate, {
                  includePrefix: true,
               }),
      )

      if (existingTaxRate) {
         taxRateMap.set(paymentTaxRate, existingTaxRate)
      } else {
         toBeCreated.push(paymentTaxRate)
      }
   }

   const createdTaxRates = await createMissingTaxRates(client, toBeCreated)
   if (createdTaxRates.isErr()) {
      return createdTaxRates
   }

   for (const createdTaxRate of createdTaxRates.value) {
      const paymentTaxRate = toBeCreated.find(
         (rate) =>
            rate.toNumber() === createdTaxRate.percentage &&
            TaxRate.getDisplayName(rate, {
               includePrefix: true,
            }) === createdTaxRate.display_name,
      )
      if (paymentTaxRate) {
         taxRateMap.set(paymentTaxRate, createdTaxRate)
      } else {
         return Result.err("TAX_RATE_NOT_FOUND")
      }
   }

   return Result.ok(taxRateMap)
}
