import { Result } from "@flagg2/result"
import { Payee } from "../payment/Payee"
import { Payer } from "../payment/Payer"
import z from "zod"
import { Payment } from "../payment/Payment"
import { PaymentItem } from "../payment/PaymentItem"

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

function parseUnknown(invoice: unknown): Result<Invoice> {
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
      price: z.object({
         whole: z.number().int().positive(),
         decimal: z.number().int().positive(),
      }),
      taxRate: z.object({
         name: z.string().nonempty(),
         rate: z.number().int().positive(),
         type: z.enum(["inclusive", "exclusive"]),
      }),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
   })

   const mapLikeItemsSchema = z.map(
      paymentItemSchema,
      z.number().int().positive(),
   )
   const arrayLikeItemsSchema = z.array(
      z.object({
         item: paymentItemSchema,
         quantity: z.number().int().positive(),
      }),
   )

   const schema = z.object({
      invoiceData: z.object({
         createdDate: z.date(),
         deliveryDate: z.date(),
         dueDate: z.date(),
         number: z.string().nonempty(),
         numberPrefix: z.string().nonempty(),
         status: z.enum(["unpaid", "partiallyPaid", "paid"]),
         paymentMethod: z.enum(["cash", "card", "transfer"]),
         logoUrl: z.string().optional(),
         note: z.string().optional(),
         variableSymbol: z.number().int().positive().optional(),
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
         items: z.union([mapLikeItemsSchema, arrayLikeItemsSchema]),
      }),
   })

   try {
      const parsed = schema.parse(invoice)

      if (Array.isArray(parsed.payment.items)) {
         const itemMap = new Map<PaymentItem, number>()
         for (const { item, quantity } of parsed.payment.items) {
            itemMap.set(item, quantity)
         }
         parsed.payment.items = itemMap

         return Result.ok(parsed as Invoice)
      }

      return Result.ok(parsed as Invoice)
   } catch (error) {
      if (error instanceof z.ZodError) {
         return Result.err(error)
      }
      return Result.err(new Error("Unknown error"))
   }
}

export type { Invoice, InvoiceData }

export const invoiceQuery = {
   parseUnknown,
}
