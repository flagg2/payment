import { Stripe as StripeSdk } from "stripe"
import { Payment } from "../payment/Payment"
import { AsyncResult, Result } from "@flagg2/result"
import Decimal from "decimal.js"
import { TaxRate } from "../payment/TaxRate"
import { StructuralMap } from "../utils/StructuralMap"
import { takeWhileHasMore } from "./utils"

type StripeTaxRate = StripeSdk.TaxRate

async function createMissingTaxRates(
   client: StripeSdk,
   toCreate: Decimal[],
): AsyncResult<StripeTaxRate[]> {
   const createdTaxRates = await Result.from(
      Promise.all(
         toCreate.map((rate) =>
            client.taxRates.create({
               display_name: TaxRate.getDisplayName(rate),
               inclusive: false,
               percentage: rate.toNumber(),
            }),
         ),
      ),
   )
   if (createdTaxRates.isErr()) {
      return Result.err(createdTaxRates.error)
   }
   return Result.ok(createdTaxRates.value)
}

export async function getTaxRateMap(
   client: StripeSdk,
   payment: Payment,
): AsyncResult<StructuralMap<Decimal, StripeTaxRate>> {
   // TODO: make readonly
   const taxRateMap = new StructuralMap<Decimal, StripeTaxRate>()
   const allRates = await takeWhileHasMore(() =>
      client.taxRates.list({ limit: 100 }),
   )
   if (allRates.isErr()) {
      return Result.err(allRates.error)
   }
   const existingTaxRates = allRates.value.filter((rate) => rate.active)

   const taxRatesOfPayment = Payment.getTaxRates(payment)
   const toBeCreated: Decimal[] = []

   for (const paymentTaxRate of taxRatesOfPayment) {
      const existingTaxRate = existingTaxRates.find(
         (rate) =>
            rate.percentage === paymentTaxRate.toNumber() &&
            rate.display_name === TaxRate.getDisplayName(paymentTaxRate),
      )

      if (existingTaxRate) {
         taxRateMap.set(paymentTaxRate, existingTaxRate)
      } else {
         toBeCreated.push(paymentTaxRate)
      }
   }

   const createdTaxRates = await createMissingTaxRates(client, toBeCreated)
   if (createdTaxRates.isErr()) {
      return Result.err(createdTaxRates.error)
   }

   for (const createdTaxRate of createdTaxRates.value) {
      const paymentTaxRate = toBeCreated.find(
         (rate) =>
            rate.toNumber() === createdTaxRate.percentage &&
            TaxRate.getDisplayName(rate) === createdTaxRate.display_name,
      )
      if (paymentTaxRate) {
         taxRateMap.set(paymentTaxRate, createdTaxRate)
      } else {
         return Result.err(new Error("Created tax rate not found"))
      }
   }

   return Result.ok(taxRateMap)
}
