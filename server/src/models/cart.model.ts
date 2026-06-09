/**
 * Cart Model — Persisted shopping cart tied to authenticated users.
 *
 * Why persist carts in the database instead of client-side storage?
 * - Cart survives across devices and browser sessions
 * - Server-side validation of prices prevents client-side manipulation
 * - Abandoned cart recovery becomes possible for future marketing features
 *
 * Indexing: user field has a unique index (declared via `unique: true`)
 * because each user has exactly one cart. This ensures O(1) cart lookups.
 */

import { Schema, model } from "mongoose";
import { ICart } from "../types";

const cartItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      max: [99, "Quantity cannot exceed 99"],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
  },
  { _id: true },
);

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const Cart = model<ICart>("Cart", cartSchema);
