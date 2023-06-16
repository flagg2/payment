import { AsyncResult, Result } from "@flagg2/result"
import axios, { AxiosRequestConfig, isAxiosError } from "axios"
import { util } from "zod"

type BriskResponse<T> = {
   data: T
   message: string
   status: number
}

export class ForbiddenError extends Error {
   __brand = "ApiKeyError" as const
   constructor() {
      super("Invalid or missing API key")
   }
}

export class UnprocessableEntityError extends Error {
   __brand = "UnprocessableEntityError" as const
   constructor() {
      super("Invalid request body")
   }
}

export class UnknownError extends Error {
   __brand = "UnknownError" as const
   constructor() {
      super("Unknown error")
   }
}

export type FetchError =
   | ForbiddenError
   | UnprocessableEntityError
   | UnknownError

export async function briskFetch<T>(
   url: string,
   opts?: {
      method?: "GET" | "POST" | "PUT" | "DELETE"
      apiKey?: string
      body?: unknown
   },
): AsyncResult<BriskResponse<T>, FetchError> {
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
            return Result.err(new ForbiddenError())
         }
         if (error.response?.status === 422) {
            return Result.err(new UnprocessableEntityError())
         }
         return Result.err(new UnknownError())
      }
      return Result.err(new UnknownError())
   }
}
