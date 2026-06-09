/**
 * One-time utility to drop all indexes from collections.
 *
 * Run this when index definitions change in models to prevent stale indexes
 * from lingering. After running, restart the server — Mongoose will recreate
 * indexes from the current schema definitions.
 */

import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../config/database";

async function resetIndexes(): Promise<void> {
  try {
    await connectDatabase();

    const collections = await mongoose.connection.db!.collections();

    for (const collection of collections) {
      const name = collection.collectionName;
      try {
        await collection.dropIndexes();
        console.log(`[Reset] Dropped indexes for collection: ${name}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.log(`[Reset] Skipped ${name}: ${msg}`);
      }
    }

    console.log("[Reset] Index cleanup complete");
  } catch (error) {
    console.error("[Reset] Error:", error);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
}

resetIndexes();
