import { stringifyObjectWithOrderedKeys } from "./stringifyWithOrderedKeys"

export class StructuralSet<T extends object> implements Iterable<T> {
   private readonly set: Set<string>
   private readonly keyMap: Map<string, T>
   private readonly keyGenerator: (obj: T) => string

   public constructor(
      keyGenerator: (obj: T) => string = stringifyObjectWithOrderedKeys,
   ) {
      this.set = new Set<string>()
      this.keyMap = new Map<string, T>()
      this.keyGenerator = keyGenerator
   }

   public add(obj: T): void {
      const key = this.generateKey(obj)
      this.set.add(key)
      this.keyMap.set(key, obj)
   }

   public delete(obj: T): boolean {
      const key = this.generateKey(obj)
      return this.set.delete(key)
   }

   public has(obj: T): boolean {
      const key = this.generateKey(obj)
      return this.set.has(key)
   }

   public clear(): void {
      this.set.clear()
   }

   public size(): number {
      return this.set.size
   }

   public values(): T[] {
      return Array.from(this.keyMap.values())
   }

   public [Symbol.iterator](): Iterator<T> {
      return this.values()[Symbol.iterator]()
   }

   private generateKey(obj: T): string {
      return this.keyGenerator(obj)
   }
}
