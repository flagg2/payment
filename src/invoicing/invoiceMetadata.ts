import z from "zod"

type InvoiceMetadata = z.infer<typeof schema>

const schema = z.object({
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
})

/**
 * Returns a schema for the invoice metadata.
 *
 * @returns - A schema for invoice metadata.
 */

function getSchema() {
   return schema
}

function create(invoice: InvoiceMetadata): InvoiceMetadata {
   return invoice
}

const InvoiceMetadata = {
   create,
   getSchema,
}

export { InvoiceMetadata }
