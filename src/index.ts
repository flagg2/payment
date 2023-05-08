import { ICustomer, createCustomer } from "./Customer"
import { IPayment, Payment, createPayment } from "./Payment"
import { ITaxRate } from "./TaxRate"
import {
   Currency,
   IPrice,
   IPaymentItem,
   IPaymentItemWithOptionalTaxRate,
} from "./PaymentItem"
import { InvoiceGenerator, createInvoiceGenerator } from "./InvoiceGenerator"
import { Stripe, createStripe } from "./Stripe"

import { stub } from "./tests/invoice.test"

export { createCustomer, createPayment, createInvoiceGenerator, createStripe }

export type {
   ICustomer,
   IPayment,
   Payment,
   InvoiceGenerator,
   ITaxRate,
   Currency,
   IPrice,
   IPaymentItem,
   IPaymentItemWithOptionalTaxRate,
   Stripe,
}
