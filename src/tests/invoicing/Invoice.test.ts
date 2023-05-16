import { beforeEach, expect, it, describe, beforeAll } from "vitest"
import { Invoice } from "../../invoicing/Invoice"
import Decimal from "decimal.js"
import dotenv from "dotenv"
import pdfParse from "pdf-parse/lib/pdf-parse"
import {
   ForbiddenError,
   UnknownError,
   UnprocessableEntityError,
} from "../../utils/briskFetch"

let unparsedMapInvoice: any
let parsedMapInvoice: Invoice

let arrayItemsInvoice: any

beforeAll(() => {
   dotenv.config({ path: ".env.test" })
})

beforeEach(() => {
   unparsedMapInvoice = {
      invoiceData: {
         createdDate: new Date(),
         dueDate: new Date(),
         deliveryDate: new Date(),
         number: "001",
         numberPrefix: "2023",
         status: "paid",
         paymentMethod: "card",
         logoUrl:
            "https://www.tailorbrands.com/wp-content/uploads/2020/07/mcdonalds-logo.jpg",
         note: "Thank you for your business",
         variableSymbol: 123456789,
      },
      payee: {
         name: "McDonalds",
         billingInfo: {
            city: "Brno",
            country: "Czech Republic",
            street: "Křížová 25",
            zip: "60200",
         },
         companyInfo: {
            businessId: "123456789",
            taxId: "CZ123456789",
            vatId: "CZ123456789",
         },
      },
      payer: {
         name: "John Doe",
         billingInfo: {
            city: "Brno",
            country: "Czech Republic",
            street: "Křížová 25",
            zip: "60200",
         },
         companyInfo: {
            businessId: "123456789",
            taxId: "CZ123456789",
            vatId: "CZ123456789",
         },
      },
      payment: {
         currency: "EUR",
         items: new Map([
            [
               {
                  name: "Big Mac",
                  priceWithoutTax: 3.99,
                  taxRate: 21,
               },
               1,
            ],
         ]),
      },
   }

   parsedMapInvoice = {
      ...unparsedMapInvoice,
      payment: {
         ...unparsedMapInvoice.payment,
         items: new Map([
            [
               {
                  name: "Big Mac",
                  priceWithoutTax: new Decimal(3.99),
                  taxRate: new Decimal(21),
               },
               new Decimal(1),
            ],
         ]),
      },
   }

   arrayItemsInvoice = {
      ...unparsedMapInvoice,
      payment: {
         ...unparsedMapInvoice.payment,
         items: [
            {
               item: {
                  name: "Big Mac",
                  priceWithoutTax: 3.99,
                  taxRate: 21,
               },
               quantity: 1,
            },
         ],
      },
   }
})

describe("Invoice with map items", () => {
   it("Should validate a correct invoice", () => {
      const result = Invoice.parseUnknown(unparsedMapInvoice)
      expect(result.isOk()).toBe(true)
      if (result.isErr()) return

      const { value } = result
      expect(value).toStrictEqual(parsedMapInvoice)
   })

   it("Should not validate an invoice with missing required fields", () => {
      const result = Invoice.parseUnknown({
         ...unparsedMapInvoice,
         payee: {
            ...unparsedMapInvoice.payee,
            companyInfo: undefined,
         },
      })
      expect(result.isOk()).toBe(false)
   })

   it("Should not validate an invoice with invalid fields", () => {
      const result = Invoice.parseUnknown({
         ...unparsedMapInvoice,
         invoiceData: {
            ...unparsedMapInvoice.invoiceData,
            number: 1,
         },
      })
      expect(result.isOk()).toBe(false)
   })

   // TODO: later
   it.skip("Should not validate an invoice with duplicate items", () => {
      const result = Invoice.parseUnknown({
         ...unparsedMapInvoice,
         payment: {
            ...unparsedMapInvoice.payment,
            items: new Map([
               [
                  {
                     name: "Big Mac",
                     priceWithoutTax: 3.99,
                     taxRate: 21,
                  },
                  1,
               ],
               [
                  {
                     name: "Big Mac",
                     priceWithoutTax: 3.99,
                     taxRate: 21,
                  },
                  1,
               ],
            ]),
         },
      })
      expect(result.isOk()).toBe(false)
   })

   it("Should accept decimal class values", () => {
      const result = Invoice.parseUnknown({
         ...unparsedMapInvoice,
         payment: {
            ...unparsedMapInvoice.payment,
            items: new Map([
               [
                  {
                     name: "Big Mac",
                     priceWithoutTax: new Decimal(3.99),
                     taxRate: new Decimal(21),
                  },
                  new Decimal(1),
               ],
            ]),
         },
      })
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toStrictEqual(parsedMapInvoice)
   })
})

describe("Invoice with array items", () => {
   it("Should validate a correct invoice", () => {
      const result = Invoice.parseUnknown(arrayItemsInvoice)
      expect(result.isOk()).toBe(true)
      if (result.isErr()) return

      const { value } = result
      expect(value).toEqual(parsedMapInvoice)
   })

   it("Should not validate an invoice with missing required fields", () => {
      const result = Invoice.parseUnknown({
         ...arrayItemsInvoice,
         payee: {
            ...arrayItemsInvoice.payee,
            companyInfo: undefined,
         },
      })
      expect(result.isOk()).toBe(false)
   })

   it("Should not validate an invoice with invalid fields", () => {
      const result = Invoice.parseUnknown({
         ...arrayItemsInvoice,
         invoiceData: {
            ...arrayItemsInvoice.invoiceData,
            number: 1,
         },
      })
      expect(result.isOk()).toBe(false)
   })

   // TODO: later
   it.skip("Should not validate an invoice with duplicate items", () => {
      const result = Invoice.parseUnknown({
         ...arrayItemsInvoice,
         payment: {
            ...arrayItemsInvoice.payment,
            items: [
               {
                  item: {
                     name: "Big Mac",
                     priceWithoutTax: 3.99,
                     taxRate: {
                        name: "21%",
                        rate: 21,
                        type: "inclusive",
                     },
                  },
                  quantity: 1,
               },
               {
                  item: {
                     name: "Big Mac",
                     priceWithoutTax: {
                        whole: 3,
                        decimal: 99,
                     },
                     taxRate: {
                        name: "21%",
                        rate: 21,
                        type: "inclusive",
                     },
                  },
                  quantity: 1,
               },
            ],
         },
      })
      expect(result.isOk()).toBe(false)
   })
})

describe("Create pdf", () => {
   it(
      "Should generate base64 pdf from valid invoice",
      async () => {
         const result = await Invoice.createPdf(
            {
               ...parsedMapInvoice,
               payment: {
                  ...parsedMapInvoice.payment,
                  items: new Map([
                     [
                        {
                           name: "Big Mac",
                           priceWithoutTax: new Decimal(3.99),
                           taxRate: new Decimal(21),
                        },
                        new Decimal(1),
                     ],
                  ]),
               },
            },
            {
               apiKey: process.env.INVOICING_SERVICE_API_KEY as string,
               url: process.env.INVOICING_SERVICE_URL as string,
            },
         )
         expect(result.isOk()).toBe(true)
         if (result.isErr()) return

         const { value } = result

         const pdf = Buffer.from(value.base64, "base64")
         expect(pdf.length).toBeGreaterThan(0)

         const pdfInfo = await pdfParse(pdf)
         expect(pdfInfo.numpages).toBe(1)
         expect(pdfInfo.text).toContain("Big Mac")
         expect(pdfInfo.text).toContain("Faktúra")
         expect(pdfInfo.text).toContain("Odoberateľ".toUpperCase())
         expect(pdfInfo.text).toContain("Dodávateľ".toUpperCase())
         expect(pdfInfo.text).toContain("DPH")
         expect(pdfInfo.text).not.toContain("Debilko")
      },
      {
         timeout: 30000,
      },
   )

   it("Should not generate pdf from invalid invoice", async () => {
      const result = await Invoice.createPdf(
         {
            ...parsedMapInvoice,
            payment: {
               ...parsedMapInvoice.payment,
               items: new Map([
                  [
                     {
                        priceWithoutTax: new Decimal(3.99),
                        taxRate: new Decimal(21),
                     },
                     new Decimal(1),
                  ],
               ]) as any,
            },
         },
         {
            apiKey: process.env.INVOICING_SERVICE_API_KEY as string,
            url: process.env.INVOICING_SERVICE_URL as string,
         },
      )
      expect(result.isOk()).toBe(false)
      expect(result.unwrapErr()).toBeInstanceOf(UnprocessableEntityError)
   })

   it("Should not work with invalid api key", async () => {
      const result = await Invoice.createPdf(parsedMapInvoice, {
         apiKey: "invalid",
         url: process.env.INVOICING_SERVICE_URL as string,
      })
      expect(result.isOk()).toBe(false)
      expect(result.unwrapErr()).toBeInstanceOf(ForbiddenError)
   })

   it("Should not work with invalid url", async () => {
      const result = await Invoice.createPdf(parsedMapInvoice, {
         apiKey: process.env.INVOICING_SERVICE_API_KEY as string,
         url: "invalid",
      })
      expect(result.isOk()).toBe(false)
      expect(result.unwrapErr()).toBeInstanceOf(UnknownError)
   })

   it("Should be able to create multiple pdfs concurrently", async () => {
      const result = await Promise.all([
         Invoice.createPdf(parsedMapInvoice, {
            apiKey: process.env.INVOICING_SERVICE_API_KEY as string,
            url: process.env.INVOICING_SERVICE_URL as string,
         }),
         Invoice.createPdf(
            {
               ...parsedMapInvoice,
               payee: {
                  ...parsedMapInvoice.payee,
                  name: "Debilko",
               },
            },
            {
               apiKey: process.env.INVOICING_SERVICE_API_KEY as string,
               url: process.env.INVOICING_SERVICE_URL as string,
            },
         ),
      ])
      console.log({ result })
      expect(result.every((r) => r.isOk())).toBe(true)

      const pdf1 = Buffer.from(result[0].unwrap().base64, "base64")
      const pdf2 = Buffer.from(result[1].unwrap().base64, "base64")
      expect(pdf1.length).toBeGreaterThan(0)
      expect(pdf2.length).toBeGreaterThan(0)
      expect(pdf1).not.toBe(pdf2)

      const pdfInfo1 = await pdfParse(pdf1)
      const pdfInfo2 = await pdfParse(pdf2)

      expect(pdfInfo1.numpages).toBe(1)
      expect(pdfInfo2.numpages).toBe(1)
      expect(pdfInfo1.text).toContain("McDonalds")
      expect(pdfInfo2.text).toContain("Debilko")
   })
})
