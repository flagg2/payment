import { Result } from "@flagg2/result"
import z from "zod"
import { PaymentItem } from "../payment/PaymentItem"
import Decimal from "decimal.js"
import { briskFetch } from "../utils/briskFetch"
import { InvoiceMetadata } from "./invoiceMetadata"
import { positiveInteger } from "../common/decimal"
import { Currency } from "../common/currency"
import { Payer } from "../payment/Payer"
import { Payee } from "../payment/Payee"

type Invoice = z.infer<typeof schema>

const mapLikeItemsSchema = z.map(PaymentItem.getSchema(), positiveInteger)
const arrayLikeItemsSchema = z.array(
   z.object({
      item: PaymentItem.getSchema(),
      quantity: positiveInteger,
   }),
)

const schema = z.object({
   meta: InvoiceMetadata.getSchema(),
   payee: Payee.getSchema(),
   payer: Payer.getSchema(),
   payment: z.object({
      currency: Currency.getSchema(),
      items: z
         .union([mapLikeItemsSchema, arrayLikeItemsSchema])
         .transform((items) => {
            if (Array.isArray(items)) {
               const itemMap = new Map<PaymentItem, Decimal>()
               for (const { item, quantity } of items) {
                  itemMap.set(item, quantity)
               }
               return itemMap
            }
            return items
         }),
   }),
})

/**
 * Parses an unknown invoice using a schema and returns a `Result` object.
 *
 * @param invoice - The unknown invoice to parse.
 * @returns - A `Result` object containing either the parsed invoice or an error.
 */

function parseUnknown(invoice: unknown) {
   return Result.from(() => schema.parse(invoice))
}

/**
 * Returns a schema for the invoice. This schema allows for numbers to be passed instead of `Decimal` objects and
 * converts them to `Decimal` objects. It also allows for an array of items to be passed instead of a map and converts
 * it to a map.
 *
 * @returns - A schema for the invoice.
 */

function getSchema() {
   return schema
}

type ItemTransformedForFetching = {
   item: Omit<PaymentItem, "priceWithoutTax" | "taxRate"> & {
      priceWithoutTax: number
      taxRate: number
   }
   quantity: number
}

function transformItemsBeforeFetching(
   items: Map<PaymentItem, Decimal>,
): ItemTransformedForFetching[] {
   const result: ItemTransformedForFetching[] = []

   for (const [item, quantity] of items) {
      result.push({
         item: {
            ...item,
            priceWithoutTax: item.priceWithoutTax.toNumber(),
            taxRate: item.taxRate.toNumber(),
         },
         quantity: quantity.toNumber(),
      })
   }

   return result
}

/**
 * Transforms the invoice into a plain object, which does not use `Decimal` objects or maps.
 *
 * @param invoice - The invoice to transform.
 * @returns - The transformed invoice.
 */

function toPlainObject(invoice: Invoice) {
   const items = transformItemsBeforeFetching(invoice.payment.items)

   return {
      ...invoice,
      payment: {
         ...invoice.payment,
         items,
      },
   }
}

/**
 * Creates a PDF of the invoice using the PDF service. Note that this might take up to 20 seconds.
 *
 * @param invoice The invoice to create a PDF of.
 * @param pdfServiceConfig The configuration of the PDF service.
 * @returns  A `Result` object containing either the base64 encoded PDF or an error.
 */

async function createPdf(
   invoice: Invoice,
   pdfServiceConfig: {
      apiKey: string
      url: string
   },
) {
   const { apiKey, url } = pdfServiceConfig

   const urlWithPath = `${url}/invoice/pdf`

   const result = await briskFetch<string>(urlWithPath, {
      method: "POST",
      apiKey,
      body: toPlainObject(invoice),
   })

   return result.map((res) => ({ base64: res.data }))
}

/**
 * Creates an invoice.
 *
 * @param invoice The invoice to create.
 * @returns The created invoice.
 */

function create(invoice: Invoice) {
   return invoice
}

const Invoice = {
   parseUnknown,
   getSchema,
   createPdf,
   create,
   toPlainObject,
}

export { Invoice }
