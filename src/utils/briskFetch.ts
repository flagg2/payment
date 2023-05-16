import { AsyncResult, Result } from "@flagg2/result"
import axios, { AxiosRequestConfig } from "axios"

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
): AsyncResult<BriskResponse<T>> {
   try {
      const { method = "GET", apiKey, body } = opts ?? {}

      const config: AxiosRequestConfig = {
         method,
         headers: {
            "Content-Type": "application/json",
            ...(apiKey !== undefined && { Authorization: apiKey }),
         },
         ...(body !== undefined && { body: JSON.stringify(body) }),
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      const { data } = await axios<BriskResponse<T>>(url, config)

      return Result.ok(data)
   } catch (error) {
      console.log({ error })
      return Result.err(error as Error)
   }
}
