/**
 * Order Model — Represents a completed purchase.
 *
 * Design decisions:
 * - Order items store a snapshot of product name and price at time of purchase.
 *   This ensures order history remains accurate even if products are later updated or deleted.
 * - The total is stored (not computed) because it represents the agreed-upon price.
 *   Recalculating from current product prices would be incorrect if prices change.
 *
 * Indexing:
 * - user + createdAt: Supports "my orders" page with chronological sorting
 * - status: Supports admin filtering by order status
 */

import { Schema, model } from "mongoose";
import { IOrder, OrderStatus } from "../types";

const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [100, "Customer name cannot exceed 100 characters"],
    },
    address: {
      type: String,
      required: [true, "Delivery address is required"],
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^[+]?[\d\s\-()]{7,20}$/, "Please provide a valid mobile number"],
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },
    total: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
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

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

export const Order = model<IOrder>("Order", orderSchema);
