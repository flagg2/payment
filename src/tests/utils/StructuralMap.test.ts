import { describe, it, expect } from "vitest"
import { StructuralMap } from "../../utils/StructuralMap"

describe("StructuralMap", () => {
   it("should set and get a key-value pair", () => {
      const structuralMap = new StructuralMap()
      const key = { a: 1, b: 2 }
      const value = "test"
      structuralMap.set(key, value)
      expect(structuralMap.get(key)).toBe(value)
   })

   it("should return the correct size", () => {
      const structuralMap = new StructuralMap()
      const key1 = { a: 1, b: 2 }
      const key2 = { b: 2, a: 1 }
      const value = "test"
      structuralMap.set(key1, value)
      structuralMap.set(key2, value)
      expect(structuralMap.size).toBe(1)
   })

   it("should check if a key exists", () => {
      const structuralMap = new StructuralMap()
      const key = { a: 1, b: 2 }
      const value = "test"
      structuralMap.set(key, value)
      expect(structuralMap.has(key)).toBe(true)
   })

   it("should delete a key-value pair", () => {
      const structuralMap = new StructuralMap()
      const key = { a: 1, b: 2 }
      const value = "test"
      structuralMap.set(key, value)
      expect(structuralMap.size).toBe(1)
      structuralMap.delete(key)
      expect(structuralMap.size).toBe(0)
   })

   it("should clear the map", () => {
      const structuralMap = new StructuralMap()
      const key1 = { a: 1, b: 2 }
      const key2 = { b: 2, a: 1 }
      const value = "test"
      structuralMap.set(key1, value)
      structuralMap.set(key2, value)
      expect(structuralMap.size).toBe(1)
      structuralMap.clear()
      expect(structuralMap.size).toBe(0)
   })

   it("should return the keys", () => {
      const structuralMap = new StructuralMap()
      const key = { a: 1, b: 2 }
      const value = "test"
      structuralMap.set(key, value)
      const keys = structuralMap.keys()
      expect(keys).toEqual([key])
   })

   it("should return the values", () => {
      const structuralMap = new StructuralMap()
      const key = { a: 1, b: 2 }
      const value = "test"
      structuralMap.set(key, value)
      const values = structuralMap.values()
      expect(values).toEqual([value])
   })

   it("should return the entries", () => {
      const structuralMap = new StructuralMap()
      const key = { a: 1, b: 2 }
      const value = "test"
      structuralMap.set(key, value)
      const entries = structuralMap.entries()
      expect(entries).toEqual([[key, value]])
   })

   it("should handle complex objects as keys", () => {
      const structuralMap = new StructuralMap()
      const key1 = { a: 1, b: { c: 2, d: 3 }, e: [4, 5, 6] }
      const key2 = { b: { d: 3, c: 2 }, a: 1, e: [4, 5, 6] }
      const value1 = "test1"
      const value2 = "test2"
      structuralMap.set(key1, value1)
      structuralMap.set(key2, value2)
      expect(structuralMap.get(key1)).toBe(value2)
      expect(structuralMap.get(key2)).toBe(value2)
      expect(structuralMap.size).toBe(1)
   })

   it("should differentiate between different complex keys", () => {
      const structuralMap = new StructuralMap()
      const key1 = { a: 1, b: { c: 2, d: 3 }, e: [4, 5, 6] }
      const key2 = { a: 1, b: { c: 2, d: { e: 3 } }, f: [4, 5, 6] }
      const value1 = "test1"
      const value2 = "test2"
      structuralMap.set(key1, value1)
      structuralMap.set(key2, value2)
      expect(structuralMap.get(key1)).toBe(value1)
      expect(structuralMap.get(key2)).toBe(value2)
      expect(structuralMap.size).toBe(2)
   })

   it("should return correct keys for complex keys", () => {
      const structuralMap = new StructuralMap()
      const key1 = { a: 1, b: { c: 2, d: 3 }, e: [4, 5, 6] }
      const key2 = { a: 1, b: { c: 2, d: { e: 3 } }, f: [4, 5, 6] }
      const value1 = "test1"
      const value2 = "test2"
      structuralMap.set(key1, value1)
      structuralMap.set(key2, value2)
      const keys = structuralMap.keys()
      expect(keys).toEqual([key1, key2])
   })

   it("should return correct entries for complex keys", () => {
      const structuralMap = new StructuralMap()
      const key1 = { a: 1, b: { c: 2, d: 3 }, e: [4, 5, 6] }
      const key2 = { a: 1, b: { c: 2, d: { e: 3 } }, f: [4, 5, 6] }
      const value1 = "test1"
      const value2 = "test2"
      structuralMap.set(key1, value1)
      structuralMap.set(key2, value2)
      const entries = structuralMap.entries()
      expect(entries).toEqual([
         [key1, value1],
         [key2, value2],
      ])
   })
})
