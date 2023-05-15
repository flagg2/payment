import { isPlainObject } from "../../utils/isPlainObject"
import { describe, it, expect } from "vitest"

describe("isPlainObject", () => {
   it("should return true for a plain object", () => {
      expect(isPlainObject({})).toBe(true)
      expect(isPlainObject({ foo: "bar" })).toBe(true)
      expect(isPlainObject(new Object())).toBe(true)
      expect(isPlainObject(Object.create({}))).toBe(true)
      expect(
         isPlainObject({
            a: 1,
            b: [1, 2, 3],
            c: {
               d: 4,
               e: new Date(),
            },
         }),
      ).toBe(true)
   })

   it("should return false for non-plain objects", () => {
      expect(isPlainObject(Object.create(null))).toBe(false)
      expect(isPlainObject([])).toBe(false)
      expect(isPlainObject(null)).toBe(false)
      expect(isPlainObject(undefined)).toBe(false)
      expect(isPlainObject(42)).toBe(false)
      expect(isPlainObject("hello")).toBe(false)
      expect(isPlainObject(new Date())).toBe(false)
      expect(isPlainObject(new Map())).toBe(false)
      expect(isPlainObject(new Set())).toBe(false)
      // Add more test cases for non-plain objects if needed
   })
})
