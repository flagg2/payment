import { AsyncResult, Result } from "@flagg2/result"
import { Payee } from "../payment/Payee"
import { Payer } from "../payment/Payer"
import z from "zod"
import { Payment } from "../payment/Payment"
import { PaymentItem } from "../payment/PaymentItem"
import Decimal from "decimal.js"
import { FetchError, briskFetch } from "../utils/briskFetch"

type Invoice = {
   invoiceData: InvoiceData
   payment: Payment
   payee: Payee
   payer: Payer
}

type InvoiceData = {
   createdDate: Date
   deliveryDate: Date
   dueDate: Date
   number: string
   numberPrefix: string
   status: "unpaid" | "partiallyPaid" | "paid"
   paymentMethod: "cash" | "card" | "transfer"
   logoUrl?: string
   note?: string
   variableSymbol?: number
}

const companyInfoSchema = z.object({
   businessId: z.string().nonempty(),
   taxId: z.string().optional(),
   vatId: z.string().optional(),
})

const addressSchema = z.object({
   street: z.string().nonempty(),
   city: z.string().nonempty(),
   zip: z.string().nonempty(),
   country: z.string().nonempty(),
})

const paymentItemSchema = z.object({
   name: z.string().nonempty(),
   priceWithoutTax: z.coerce
      .number()
      .positive()
      .transform((value) => new Decimal(value)),
   taxRate: z.coerce
      .number()
      .positive()
      .transform((value) => new Decimal(value)),
   description: z.string().optional(),
   imageUrl: z.string().optional(),
})

const mapLikeItemsSchema = z.map(
   paymentItemSchema,
   z.coerce
      .number()
      .int()
      .positive()
      .transform((value) => new Decimal(value)),
)
const arrayLikeItemsSchema = z.array(
   z.object({
      item: paymentItemSchema,
      quantity: z.coerce
         .number()
         .int()
         .positive()
         .transform((value) => new Decimal(value)),
   }),
)

const schema = z.object({
   invoiceData: z.object({
      createdDate: z.coerce.date(),
      deliveryDate: z.coerce.date(),
      dueDate: z.coerce.date(),
      number: z.string().nonempty(),
      numberPrefix: z.string().nonempty(),
      status: z.enum(["unpaid", "partiallyPaid", "paid"]),
      paymentMethod: z.enum(["cash", "card", "transfer"]),
      logoUrl: z.string().optional(),
      note: z.string().optional(),
      variableSymbol: z.coerce.number().int().positive().optional(),
   }),
   payee: z.object({
      name: z.string().nonempty(),
      billingInfo: addressSchema,
      companyInfo: companyInfoSchema,
   }),
   payer: z.object({
      name: z.string().nonempty(),
      billingInfo: addressSchema,
      shippingInfo: addressSchema.optional(),
      companyInfo: companyInfoSchema.optional(),
   }),
   payment: z.object({
      currency: z.enum(["CZK", "EUR", "USD"]),
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

function parseUnknown(invoice: unknown): Result<Invoice> {
   try {
      return Result.ok(schema.parse(invoice))
   } catch (error) {
      if (error instanceof z.ZodError) {
         return Result.err(error)
      }
      return Result.err(new Error("Unknown error"))
   }
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
): AsyncResult<{ base64: string }, FetchError> {
   const { apiKey, url } = pdfServiceConfig

   const urlWithPath = `${url}/invoice/pdf`

   const result = await briskFetch<string>(urlWithPath, {
      method: "POST",
      apiKey,
      body: toPlainObject(invoice),
   })

   if (result.isErr()) {
      return Result.err(result.error)
   }

   return Result.ok({ base64: result.value.data })
}

const Invoice = {
   parseUnknown,
   getSchema,
   createPdf,
   toPlainObject,
}

export { Invoice, InvoiceData }
