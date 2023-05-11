// A number between 0 and 100

type TaxRate = {
   name: string
   rate: number
   type: "inclusive" | "exclusive"
}

export type { TaxRate }
