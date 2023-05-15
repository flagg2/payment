import { stringifyObjectWithOrderedKeys } from "./stringifyWithOrderedKeys"

export class StructuralSet<T extends object> implements Iterable<T> {
   private readonly set: Set<string>
   private readonly keyGenerator: (obj: T) => string

   public constructor(
      keyGenerator: (obj: T) => string = stringifyObjectWithOrderedKeys,
   ) {
      this.set = new Set<string>()
      this.keyGenerator = keyGenerator
   }

   public add(obj: T): void {
      const key = this.keyGenerator(obj)
      this.set.add(key)
   }

   public delete(obj: T): boolean {
      const key = this.keyGenerator(obj)
      return this.set.delete(key)
   }

   public has(obj: T): boolean {
      const key = this.keyGenerator(obj)
      return this.set.has(key)
   }

   public clear(): void {
      this.set.clear()
   }

   public size(): number {
      return this.set.size
   }

   public values(): T[] {
      return Array.from(this.set.values()).map((key) => JSON.parse(key) as T)
   }

   public entries(): T[] {
      return Array.from(this.set.entries()).map(([key]) => JSON.parse(key) as T)
   }

   public [Symbol.iterator](): Iterator<T> {
      return this.values()[Symbol.iterator]()
   }
}
