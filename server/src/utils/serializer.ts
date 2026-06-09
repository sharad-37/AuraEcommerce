/**
 * Utility for transforming lean MongoDB documents to API response shape.
 *
 * Why needed?
 * Mongoose's .lean() option returns plain JavaScript objects for performance,
 * but it bypasses schema toJSON transforms. Our API contract specifies that
 * responses use `id` (not `_id`) and exclude internal fields like __v.
 *
 * This utility centralizes that transformation so every endpoint serializes
 * consistently regardless of whether the query used .lean() or returned
 * hydrated documents.
 *
 * Trade-off vs. removing .lean():
 * Lean queries are 3-5x faster on large result sets because they skip
 * Mongoose document hydration. The cost is having to handle serialization
 * manually - acceptable for the performance gain on read-heavy endpoints.
 */

import { Types } from "mongoose";

type LeanDocument = Record<string, unknown> & { _id?: Types.ObjectId | string };

/**
 * Transforms a single lean document:
 * - Renames _id to id (as string)
 * - Removes __v
 * - Recursively transforms nested documents/arrays
 */
export function serialize<T>(doc: LeanDocument | null): T | null {
  if (doc === null || doc === undefined) {
    return null;
  }
  return transformDocument(doc) as T;
}

/**
 * Transforms an array of lean documents.
 */
export function serializeMany<T>(docs: LeanDocument[]): T[] {
  return docs.map((doc) => transformDocument(doc)) as T[];
}

function transformDocument(input: unknown): unknown {
  if (input === null || input === undefined) {
    return input;
  }

  if (input instanceof Types.ObjectId) {
    return input.toString();
  }

  if (input instanceof Date) {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => transformDocument(item));
  }

  if (typeof input === "object") {
    const obj = input as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (key === "__v") continue;

      if (key === "_id") {
        result["id"] =
          value instanceof Types.ObjectId ? value.toString() : value;
        continue;
      }

      result[key] = transformDocument(value);
    }

    return result;
  }

  return input;
}
