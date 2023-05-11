import { AsyncResult, Result } from "@flagg2/result"
import axios from "axios"

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

function extractPrefix(vat: string): Result<keyof typeof KNOWN_PREFIXES> {
   return Result.from(() => {
      const prefix = vat.slice(0, 2)
      if (!castIncludes(KNOWN_PREFIXES, prefix)) {
         throw new Error(`Unknown prefix ${prefix}`)
      }
      return prefix as keyof typeof KNOWN_PREFIXES
   })
}

function extractNumber(vat: string): Result<string> {
   return Result.from(() => {
      const number = vat.slice(2)
      if (!number) {
         throw new Error(`No number found in ${vat}`)
      }
      return number
   })
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

async function isVatValid(vat: string): AsyncResult<boolean> {
   const prefix = extractPrefix(vat)
   const number = extractNumber(vat)

   if (prefix.isErr() || number.isErr()) {
      return Result.err(new Error("Invalid VAT number"))
   }

   const response = await Result.from(
      axios.get<VatNumberValidationResult>(
         `${API_URL}/${String(prefix.value)}/vat/${number.value}`,
      ),
   )

   if (response.isErr()) {
      return Result.err(response.error)
   }

   const { isValid } = response.value.data

   return Result.ok(isValid)
}

export { isVatValid }
