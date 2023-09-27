import { AsyncResult, Result } from "@flagg2/result"
import axios, { AxiosRequestConfig, isAxiosError } from "axios"

type BriskResponse<T> = {
   data: T
   message: string
   status: number
}

export async function briskFetch<T>(
   url: string,
   opts?: {
      method?: "GET" | "POST" | "PUT" | "DELETE"
      apiKey?: string
      body?: unknown
   },
) {
   try {
      const { method = "GET", apiKey, body } = opts ?? {}

      const config: AxiosRequestConfig = {
         method,
         headers: {
            "Content-Type": "application/json",
            ...(apiKey !== undefined && { Authorization: apiKey }),
         },
         ...(body !== undefined && { data: body }),
      }

      const { data } = await axios<BriskResponse<T>>(url, config)

      return Result.ok(data)
   } catch (error) {
      if (isAxiosError(error)) {
         console.log(`Request to ${url} failed`)
         console.dir(error.response?.data, { depth: null })
         if (error.response?.status === 403) {
            return Result.err("FORBIDDEN")
         }
         if (error.response?.status === 422) {
            return Result.err("UNPROCESSABLE_ENTITY")
         }
      }
      return Result.err("UNKNOWN")
   }
}
