import { Address } from "../common/address"
import { Result } from "@flagg2/result"
import axios from "axios"
import { z } from "zod"
import { CompanyInfo } from "../common/companyInfo"

type Payer = z.infer<typeof schema>

const schema = z.object({
   name: z.string().nonempty(),
   billingInfo: Address.getSchema(),
   shippingInfo: Address.getSchema().optional(),
   companyInfo: CompanyInfo.getSchema(),
})

const API_URL = "https://ec.europa.eu/taxation_customs/vies/rest-api/ms"

const KNOWN_PREFIXES = [
   "AT",
   "BE",
   "BG",
   "CY",
   "CZ",
   "DE",
   "DK",
   "EE",
   "EL",
   "ES",
   "FI",
   "FR",
   "GB",
   "HR",
   "HU",
   "IE",
   "IT",
   "LT",
   "LU",
   "LV",
   "MT",
   "NL",
   "PL",
   "PT",
   "RO",
   "SE",
   "SI",
   "SK",
] as const

function castIncludes<T extends readonly string[]>(arr: T, val: string) {
   // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
   return arr.includes(val as any)
}

function extractPrefix(vat: string) {
   return Result.from(
      () => {
         const prefix = vat.slice(0, 2)
         if (!castIncludes(KNOWN_PREFIXES, prefix)) {
            throw new Error(`Unknown prefix ${prefix}`)
         }
         return prefix as keyof typeof KNOWN_PREFIXES
      },
      () => "UNKNOWN_PREFIX_ERROR",
   )
}

function extractNumber(vat: string) {
   return Result.from(
      () => {
         const number = vat.slice(2)
         if (!number) {
            throw new Error(`No number found in ${vat}`)
         }
         return number
      },
      () => "INVALID_VAT_ERROR",
   )
}

type VatNumberValidationResult = {
   isValid: boolean
   requestDate: string
   userError: string
   name: string
   address: string
   requestIdentifier: string
   vatNumber: string
}

// TODO: add autocomplete
/**
 * Check the validity of the VAT number of the payer against the european VIES database.
 *
 * @param payer The payer to check the VAT number for.
 * @returns  A `Result` object containing either the validity of the VAT number
 * in case it was in the correct format or an error.
 */

async function hasValidVat(payer: Payer) {
   if (payer.companyInfo.vatId === undefined) {
      return Result.ok(false)
   }

   const prefix = extractPrefix(payer.companyInfo.vatId)
   const number = extractNumber(payer.companyInfo.vatId)

   if (prefix.isErr() || number.isErr()) {
      return Result.ok(false)
   }

   const response = await Result.from(
      axios.get<VatNumberValidationResult>(
         `${API_URL}/${String(prefix.value)}/vat/${number.value}`,
      ),
      () => "INVALID_VAT_ERROR",
   )

   return response.map((res) => res.data.isValid)
}

function create(payer: Payer) {
   return payer
}

const Payer = {
   create,
   hasValidVat,
   getSchema: () => schema,
}

export { Payer }
