export function isPlainObject(obj: unknown): obj is object {
   return typeof obj === "object" && obj !== null && obj.constructor === Object
}
