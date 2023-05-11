import { beforeEach, expect, it, describe } from "vitest"
import { Invoice, invoiceQuery } from "../../invoicing/Invoice"

let mapItemsInvoice: Invoice
let arrayItemsInvoice: any

beforeEach(() => {
   mapItemsInvoice = {
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
                  price: {
                     whole: 3,
                     decimal: 99,
                  },
                  taxRate: {
                     name: "21%",
                     rate: 21,
                     type: "inclusive",
                  },
               },
               1,
            ],
         ]),
      },
   }

   arrayItemsInvoice = {
      ...mapItemsInvoice,
      payment: {
         ...mapItemsInvoice.payment,
         items: [
            {
               item: {
                  name: "Big Mac",
                  price: {
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
   }
})

describe("Invoice with map items", () => {
   it("Should validate a correct invoice", () => {
      const result = invoiceQuery.parseUnknown(mapItemsInvoice)
      expect(result.isOk()).toBe(true)
      if (result.isErr()) return

      const { value } = result
      expect(value).toEqual(mapItemsInvoice)
   })

   it("Should not validate an invoice with missing required fields", () => {
      const result = invoiceQuery.parseUnknown({
         ...mapItemsInvoice,
         payee: {
            ...mapItemsInvoice.payee,
            companyInfo: undefined,
         },
      })
      expect(result.isOk()).toBe(false)
   })

   it("Should not validate an invoice with invalid fields", () => {
      const result = invoiceQuery.parseUnknown({
         ...mapItemsInvoice,
         invoiceData: {
            ...mapItemsInvoice.invoiceData,
            number: 1,
         },
      })
      expect(result.isOk()).toBe(false)
   })

   // TODO: later
   it.skip("Should not validate an invoice with duplicate items", () => {
      const result = invoiceQuery.parseUnknown({
         ...mapItemsInvoice,
         payment: {
            ...mapItemsInvoice.payment,
            items: new Map([
               [
                  {
                     name: "Big Mac",
                     price: {
                        whole: 3,
                        decimal: 99,
                     },
                     taxRate: {
                        name: "21%",
                        rate: 21,
                        type: "inclusive",
                     },
                  },
                  1,
               ],
               [
                  {
                     name: "Big Mac",
                     price: {
                        whole: 3,
                        decimal: 99,
                     },
                     taxRate: {
                        name: "21%",
                        rate: 21,
                        type: "inclusive",
                     },
                  },
                  1,
               ],
            ]),
         },
      })
      expect(result.isOk()).toBe(false)
   })
})

describe("Invoice with array items", () => {
   it("Should validate a correct invoice", () => {
      const result = invoiceQuery.parseUnknown(arrayItemsInvoice)
      expect(result.isOk()).toBe(true)
      if (result.isErr()) return

      const { value } = result
      expect(value).toEqual(mapItemsInvoice)
   })

   it("Should not validate an invoice with missing required fields", () => {
      const result = invoiceQuery.parseUnknown({
         ...arrayItemsInvoice,
         payee: {
            ...arrayItemsInvoice.payee,
            companyInfo: undefined,
         },
      })
      expect(result.isOk()).toBe(false)
   })

   it("Should not validate an invoice with invalid fields", () => {
      const result = invoiceQuery.parseUnknown({
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
      const result = invoiceQuery.parseUnknown({
         ...arrayItemsInvoice,
         payment: {
            ...arrayItemsInvoice.payment,
            items: [
               {
                  item: {
                     name: "Big Mac",
                     price: {
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
               {
                  item: {
                     name: "Big Mac",
                     price: {
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
