# TypeScript Style Guide

This document outlines the conventions and best practices for using TypeScript in this project. Following these guidelines ensures consistency, readability, and maintainability across the codebase.

---

## Interfaces vs Types

To ensure consistency in our codebase, follow these rules when deciding between `interface` and `type`:

### Use `interface` When:
1. **Defining Object Shapes**:
   - Use `interface` to define the structure of objects, especially for data models, API responses, or class contracts.
   - Example:
     ```typescript
     interface Product {
       id: string;
       title: string;
       price: number;
     }
     ```

2. **Working with Classes**:
   - Use `interface` to enforce contracts for classes.
   - Example:
     ```typescript
     interface Product {
       id: string;
       title: string;
     }

     class StoreProduct implements Product {
       id: string;
       title: string;

       constructor(id: string, title: string) {
         this.id = id;
         this.title = title;
       }
     }
     ```

3. **When Declaration Merging is Needed**:
   - Use `interface` if you anticipate extending or merging the shape of an object in multiple places.
   - Example:
     ```typescript
     interface Product {
       id: string;
     }

     interface Product {
       title: string;
     }

     const product: Product = {
       id: "1",
       title: "T-Shirt",
     };
     ```

4. **For Simpler and Faster Compilation**:
   - Interfaces are slightly more optimized for the TypeScript compiler, so prefer them for large object shapes.

---

### Use `type` When:
1. **Defining Complex Types**:
   - Use `type` for unions, intersections, mapped types, or conditional types.
   - Example:
     ```typescript
     type ID = string | number;

     type Product = {
       id: string;
       title: string;
     } & {
       price: number;
     };
     ```

2. **Aliasing Primitives or Functions**:
   - Use `type` to create aliases for primitive types or function signatures.
   - Example:
     ```typescript
     type ID = string | number;

     type FetchData = (url: string) => Promise<string>;
     ```

3. **When Working with Utility Types**:
   - Use `type` when leveraging TypeScript utility types like `Pick`, `Omit`, or `ReturnType`.
   - Example:
     ```typescript
     type ProductPreview = Pick<Product, "id" | "title">;
     ```

4. **For Readability in Complex Scenarios**:
   - Use `type` when the structure is complex and readability is a priority.

---

### Rule of Thumb
- **Use `interface` for objects and class contracts.**
- **Use `type` for everything else.**

---

## General TypeScript Best Practices

1. **Enable Strict Mode**:
   - Always enable `strict` mode in `tsconfig.json` to catch potential issues early.

2. **Prefer Explicit Types**:
   - Avoid relying on implicit `any`. Always define explicit types where possible.
   - Example:
     ```typescript
     // Avoid
     const fetchData = (url) => {
       return fetch(url);
     };

     // Prefer
     const fetchData = (url: string): Promise<Response> => {
       return fetch(url);
     };
     ```

3. **Use Readonly for Immutable Data**:
   - Use `readonly` to enforce immutability where applicable.
   - Example:
     ```typescript
     interface Product {
       readonly id: string;
       title: string;
     }
     ```

4. **Avoid Overusing `any`**:
   - Use `unknown` or proper types instead of `any` to maintain type safety.

5. **Use Utility Types**:
   - Leverage TypeScript utility types like `Partial`, `Pick`, `Omit`, and `Record` to simplify type definitions.

6. **Document Complex Types**:
   - Add comments to explain complex or non-obvious type definitions.

---

By following these guidelines, we can ensure a consistent and maintainable TypeScript codebase. If you have questions or suggestions, feel free to discuss them with the team!