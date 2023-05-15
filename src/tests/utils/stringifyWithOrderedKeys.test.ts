import { describe, it, expect } from "vitest"
import { stringifyObjectWithOrderedKeys } from "../../utils/stringifyWithOrderedKeys"
import Decimal from "decimal.js"

describe("stringifyWithOrderedKeys", () => {
   it("should return the stringified object with ordered keys", () => {
      const obj = { c: 1, b: 2, a: 3 }
      const expected = '{"a":3,"b":2,"c":1}'
      expect(stringifyObjectWithOrderedKeys(obj)).toBe(expected)
   })

   it("should return the stringified array with ordered keys", () => {
      const obj = [3, 2, 1]
      const expected = "[3,2,1]"
      expect(stringifyObjectWithOrderedKeys(obj)).toBe(expected)
   })

   it("should return the stringified object with ordered nested keys", () => {
      const obj = { c: 1, b: { d: 2, a: 3 }, a: 4 }
      const expected = '{"a":4,"b":{"a":3,"d":2},"c":1}'
      expect(stringifyObjectWithOrderedKeys(obj)).toBe(expected)
   })

   it("should return the stringified object when input is an empty object", () => {
      const obj = {}
      const expected = "{}"
      expect(stringifyObjectWithOrderedKeys(obj)).toBe(expected)
   })

   it("should return the stringified object when input is undefined", () => {
      const obj = { x: undefined }
      const expected = "{}"
      expect(stringifyObjectWithOrderedKeys(obj)).toBe(expected)
   })
   it("should return the stringified object with complex nested objects", () => {
      const obj = { c: 1, b: { z: 5, y: { d: 2, a: 3 } }, a: 4 }
      const expected = '{"a":4,"b":{"y":{"a":3,"d":2},"z":5},"c":1}'
      expect(stringifyObjectWithOrderedKeys(obj)).toBe(expected)
   })

   it("should return the stringified object with ordered keys when input is a date", () => {
      const obj = { x: new Date(2023, 4, 13) }
      const expected = `{"x":"${obj.x.toISOString()}"}`
      expect(stringifyObjectWithOrderedKeys(obj)).toBe(expected)
   })

   it("should handle empty arrays correctly", () => {
      const obj = []
      const expected = "[]"
      expect(stringifyObjectWithOrderedKeys(obj)).toBe(expected)
   })

   it("should handle arrays of objects correctly", () => {
      const obj = [
         { b: 2, a: 1 },
         { d: 4, c: 3 },
      ]
      const expected = '[{"a":1,"b":2},{"c":3,"d":4}]'
      expect(stringifyObjectWithOrderedKeys(obj)).toBe(expected)
   })

   it("should handle arrays with mixed types correctly", () => {
      const obj = [1, "hello", { b: 2, a: 1 }, true]
      const expected = '[1,"hello",{"a":1,"b":2},true]'
      expect(stringifyObjectWithOrderedKeys(obj)).toBe(expected)
   })

   it("should return the stringified object with ordered keys when input is an object with null values", () => {
      const obj = { b: null, a: 3 }
      const expected = '{"a":3,"b":null}'
      expect(stringifyObjectWithOrderedKeys(obj)).toBe(expected)
   })
   it("should return the stringified object with complex nested objects and arrays", () => {
      const obj = {
         c: 1,
         b: { z: 5, y: { d: [2, 7, { f: 3, e: 6 }], a: 3 } },
         a: 4,
      }
      const expected =
         '{"a":4,"b":{"y":{"a":3,"d":[2,7,{"e":6,"f":3}]},"z":5},"c":1}'
      expect(stringifyObjectWithOrderedKeys(obj)).toBe(expected)
   })

   it("should return the stringified object with mixed types in nested objects", () => {
      const obj = {
         c: "hello",
         b: { z: true, y: { d: new Date(2023, 4, 13), a: null } },
         a: [1, 2, 3],
      }
      const expected = `{"a":[1,2,3],"b":{"y":{"a":null,"d":"${new Date(
         2023,
         4,
         13,
      ).toISOString()}"},"z":true},"c":"hello"}`
      expect(stringifyObjectWithOrderedKeys(obj)).toBe(expected)
   })

   it("should handle deeply nested arrays correctly", () => {
      const obj = [1, [2, [3, [4, { b: 2, a: 1 }]]], "hello"]
      const expected = '[1,[2,[3,[4,{"a":1,"b":2}]]],"hello"]'
      expect(stringifyObjectWithOrderedKeys(obj)).toBe(expected)
   })

   it("should handle objects with array values correctly", () => {
      const obj = { b: [2, 1], a: { d: [4, 3, 2, 1], c: 3 } }
      const expected = '{"a":{"c":3,"d":[4,3,2,1]},"b":[2,1]}'
      expect(stringifyObjectWithOrderedKeys(obj)).toBe(expected)
   })

   it("should handle objects with nested null values correctly", () => {
      const obj = { b: { e: null, d: 2 }, a: { c: null, b: 1 } }
      const expected = '{"a":{"b":1,"c":null},"b":{"d":2,"e":null}}'
      expect(stringifyObjectWithOrderedKeys(obj)).toBe(expected)
   })

   it("Should work with decimals", () => {
      const obj = { a: new Decimal(1.2) }
      const expected = '{"a":1.2}'
      expect(stringifyObjectWithOrderedKeys(obj)).toBe(expected)
   })
})
