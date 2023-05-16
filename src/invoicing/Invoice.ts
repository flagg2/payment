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
