import easyinvoice from "easyinvoice"
import { IPayment } from "./Payment"
import { Currency } from "./PaymentItem"
import { DeepReadonly } from "@flagg2/ts-util"
import { AsyncResult, Result } from "@flagg2/result"
import { ICustomer } from "./Customer"

type ISender = {
   company: string
   address: string
   city: string
   zip: string
   country: string
}

class InvoiceGenerator {
   public sender: DeepReadonly<ISender>
   public constructor(sender: ISender) {
      this.sender = sender
   }

   public async generateInvoice(config: {
      payment: IPayment<Currency>
      customer: ICustomer
      logoUrl?: string
   }): AsyncResult<{
      base64: string
   }> {
      const {
         logoUrl,
         customer: {
            billingInfo: { city, country, address, zip },
         },
         payment,
      } = config

      const products: {
         description: string
         quantity: string
         price: number
         "tax-rate": number
      }[] = []

      for (const [item, quantity] of payment.items.entries()) {
         products.push({
            description: item.name,
            quantity: quantity.toString(),
            price: item.price.whole + item.price.fraction / 100,
            "tax-rate": item.taxRate.rate,
         })
      }

      products.push({
         description: "haha",
         quantity: "2",
         price: 21.2,
         "tax-rate": 20,
      })

      const result = await Result.from(
         easyinvoice.createInvoice({
            images: {
               logo: logoUrl,
            },
            client: {
               address,
               city,
               country,
               zip,
               // TODO: company
               test: "test",
            },
            settings: {
               currency: payment.currency,
            },
            information: {
               date: new Date().toISOString().slice(0, 10),
            },
            products,
            sender: this.sender,
         }),
      )

      if (result.isErr()) {
         return Result.err(result.error)
      }

      const base64 = result.value.pdf

      return Result.ok({ base64 })
   }
}

function createInvoiceGenerator(sender: ISender): InvoiceGenerator {
   return new InvoiceGenerator(sender)
}

function createSender(sender: ISender): ISender {
   return sender
}

export { createInvoiceGenerator, createSender }
export type { InvoiceGenerator }
