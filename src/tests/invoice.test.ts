import { createCustomer } from "../Customer"
import { Payment, createPayment } from "../Payment"
import { createInvoiceGenerator } from "../InvoiceGenerator"
import { Currency, IPaymentItemWithOptionalTaxRate } from "../PaymentItem"
import fs from "fs"

async function createTestInvoice() {
   const invoiceGenerator = await createInvoiceGenerator({
      address: "Test street 123",
      city: "Test city",
      company: "Test company \n second row",
      country: "Test country",
      zip: "12345",
   })

   const items = new Map([
      [
         {
            name: "Test item",
            price: {
               currency: "EUR",
               fraction: 99,
               whole: 1,
            },
         },
         1,
      ],
   ]) satisfies Map<IPaymentItemWithOptionalTaxRate<Currency>, number>

   for (let i = 1; i <= 5; i++) {
      const newItem = {
         name: `Test item ${i}`,
         price: {
            currency: "EUR" as const,
            fraction: 99,
            whole: 1,
         },
      }
      items.set(newItem, 1)
   }

   const payment = createPayment({
      currency: "EUR",
      defaultTaxRate: {
         name: "VAT",
         rate: 21,
         type: "exclusive",
      },
      items,
   })

   const customer = createCustomer({
      name: "John Doe",
      billingInfo: {
         address: "Test street 123",
         city: "Test city",
         country: "Test country",
         zip: "12345",
      },
   })

   const base64 = await invoiceGenerator.generateInvoice({
      payment: {
         currency: "EUR",
         defaultTaxRate: {
            name: "VAT",
            rate: 21,
            type: "exclusive",
         },
         items: payment.items,
      },
      customer,
   })

   fs.writeFileSync("invoice.pdf", base64.unwrap().base64, "base64")
}

export const stub = 2

createTestInvoice().catch(console.error)
