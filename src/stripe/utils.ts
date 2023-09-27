import { AsyncResult, Result } from "@flagg2/result"

export async function takeWhileHasMore<T extends object>(
   apiFn: (...args: any[]) => Promise<{
      data: T[]
      next_page?: string
      has_more: boolean
   }>,
) {
   const result: T[] = []
   let hasNext = true
   let lastResult = apiFn()
   while (hasNext) {
      const res = await Result.from(lastResult)
      if (res.isErr()) {
         return Result.err("STRIPE_API_ERROR")
      }
      const { data, has_more, next_page } = res.value
      result.push(...data)
      hasNext = has_more
      if (hasNext) {
         lastResult = apiFn({ page: next_page })
      }
   }
   return Result.ok(result)
}
