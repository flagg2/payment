import { describe, it, expect } from "vitest"
import { StructuralSet } from "../../utils/StructuralSet"

describe("StructuralSet", () => {
   it("should add an object to the set", () => {
      const structuralSet = new StructuralSet()
      const obj = { a: 1, b: 2 }
      structuralSet.add(obj)
      expect(structuralSet.size()).toBe(1)
   })

   it("should not add the same structured object to the set", () => {
      const structuralSet = new StructuralSet()
      const obj1 = { a: 1, b: 2 }
      const obj2 = { b: 2, a: 1 }
      structuralSet.add(obj1)
      structuralSet.add(obj2)
      expect(structuralSet.size()).toBe(1)
   })

   it("should delete an object from the set", () => {
      const structuralSet = new StructuralSet()
      const obj = { a: 1, b: 2 }
      structuralSet.add(obj)
      expect(structuralSet.size()).toBe(1)
      structuralSet.delete(obj)
      expect(structuralSet.size()).toBe(0)
   })

   it("should check if an object exists in the set", () => {
      const structuralSet = new StructuralSet()
      const obj = { a: 1, b: 2 }
      structuralSet.add(obj)
      expect(structuralSet.has(obj)).toBe(true)
   })

   it("should clear the set", () => {
      const structuralSet = new StructuralSet()
      const obj1 = { a: 1, b: 2 }
      const obj2 = { c: 3, d: 4 }
      structuralSet.add(obj1)
      structuralSet.add(obj2)
      expect(structuralSet.size()).toBe(2)
      structuralSet.clear()
      expect(structuralSet.size()).toBe(0)
   })

   it("should return the values in the set", () => {
      const structuralSet = new StructuralSet()
      const obj = { a: 1, b: 2 }
      structuralSet.add(obj)
      const values = structuralSet.values()
      expect(values).toEqual([obj])
   })

   it("should return the entries in the set", () => {
      const structuralSet = new StructuralSet()
      const obj = { a: 1, b: 2 }
      structuralSet.add(obj)
      const entries = structuralSet.entries()
      expect(entries).toEqual([obj])
   })
   it("should handle complex objects", () => {
      const structuralSet = new StructuralSet()
      const obj1 = { a: 1, b: { c: 2, d: 3 }, e: [4, 5, 6] }
      const obj2 = { b: { d: 3, c: 2 }, a: 1, e: [4, 5, 6] }
      structuralSet.add(obj1)
      structuralSet.add(obj2)
      expect(structuralSet.size()).toBe(1)
   })

   it("should differentiate objects with different structures", () => {
      const structuralSet = new StructuralSet()
      const obj1 = { a: 1, b: { c: 2, d: 3 }, e: [4, 5, 6] }
      const obj2 = { a: 1, b: { c: 2, d: { e: 3 } }, f: [4, 5, 6] }
      structuralSet.add(obj1)
      structuralSet.add(obj2)
      expect(structuralSet.size()).toBe(2)
   })

   it("should delete complex objects", () => {
      const structuralSet = new StructuralSet()
      const obj = { a: 1, b: { c: 2, d: 3 }, e: [4, 5, 6] }
      structuralSet.add(obj)
      expect(structuralSet.size()).toBe(1)
      structuralSet.delete(obj)
      expect(structuralSet.size()).toBe(0)
   })

   it("should check existence of complex objects", () => {
      const structuralSet = new StructuralSet()
      const obj = { a: 1, b: { c: 2, d: 3 }, e: [4, 5, 6] }
      structuralSet.add(obj)
      expect(structuralSet.has(obj)).toBe(true)
   })

   it("should handle nested arrays", () => {
      const structuralSet = new StructuralSet()
      const obj1 = { a: [1, 2, [3, 4]], b: 2 }
      const obj2 = { b: 2, a: [1, 2, [3, 4]] }
      structuralSet.add(obj1)
      structuralSet.add(obj2)
      expect(structuralSet.size()).toBe(1)
   })

   it("should return complex objects as values", () => {
      const structuralSet = new StructuralSet()
      const obj = { a: 1, b: { c: 2, d: 3 }, e: [4, 5, 6] }
      structuralSet.add(obj)
      const values = structuralSet.values()
      expect(values).toEqual([obj])
   })

   it("should return complex objects as entries", () => {
      const structuralSet = new StructuralSet()
      const obj = { a: 1, b: { c: 2, d: 3 }, e: [4, 5, 6] }
      structuralSet.add(obj)
      const entries = structuralSet.entries()
      expect(entries).toEqual([obj])
   })
})
