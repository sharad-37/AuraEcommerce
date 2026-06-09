/**
 * Product Model — Core entity representing items available for purchase.
 *
 * Indexing strategy:
 * - Compound index on { category: 1, price: 1 } serves both category-filter
 *   queries AND category+price-sort queries (MongoDB uses index prefix)
 * - Text index on name + description for full-text search
 * - Descending createdAt index for "newest first" default sorting
 *
 * Trade-off: Each index consumes memory and slows writes slightly.
 * For a read-heavy e-commerce catalog, this is an acceptable trade-off.
 */

import { Schema, model } from "mongoose";
import { IProduct } from "../types";

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      type: String,
      required: [true, "Product image URL is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      lowercase: true,
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
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

productSchema.index({ category: 1, price: 1 });
productSchema.index({ name: "text", description: "text" });
productSchema.index({ createdAt: -1 });

export const Product = model<IProduct>("Product", productSchema);
