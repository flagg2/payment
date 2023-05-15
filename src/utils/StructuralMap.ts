import { stringifyObjectWithOrderedKeys } from "./stringifyWithOrderedKeys"

export class StructuralMap<K extends object, V> {
   private readonly map: Map<string, V>
   private readonly keyGenerator: (obj: K) => string

   public constructor(
      keyGenerator: (obj: K) => string = stringifyObjectWithOrderedKeys,
   ) {
      this.map = new Map<string, V>()
      this.keyGenerator = keyGenerator
   }

   public get size(): number {
      return this.map.size
   }

   public set(key: K, value: V): this {
      const stringKey = this.generateKey(key)
      console.log({ stringKey })
      this.map.set(stringKey, value)
      return this
   }

   public get(key: K): V | undefined {
      const stringKey = this.generateKey(key)
      return this.map.get(stringKey)
   }

   public has(key: K): boolean {
      const stringKey = this.generateKey(key)
      return this.map.has(stringKey)
   }

   public delete(key: K): boolean {
      const stringKey = this.generateKey(key)
      return this.map.delete(stringKey)
   }

   public clear(): void {
      this.map.clear()
   }

   public keys(): K[] {
      return Array.from(this.map.keys()).map(
         (stringKey) => JSON.parse(stringKey) as K,
      )
   }

   public values(): V[] {
      return Array.from(this.map.values())
   }

   public entries(): [K, V][] {
      return Array.from(this.map.entries()).map(([stringKey, value]) => [
         JSON.parse(stringKey) as K,
         value,
      ])
   }

   private generateKey(obj: K): string {
      return this.keyGenerator(obj)
   }
}
