/**
 * Product business logic.
 *
 * Handles product retrieval with filtering, pagination, and sorting.
 * All query building happens here — controllers pass through validated params.
 *
 * Why serialize() calls?
 * Lean queries return raw MongoDB documents with _id (ObjectId) fields.
 * Our API contract uses string ids. The serializer transforms _id to id
 * and converts ObjectIds to strings consistently.
 */

import { Product } from "../models";
import { AppError } from "../utils/app-error";
import { serialize, serializeMany } from "../utils/serializer";
import { IProduct } from "../types";
import { SortOrder, FilterQuery } from "mongoose";

interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
}

interface PaginatedProducts {
  products: IProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function getProducts(
  params: ProductQueryParams,
): Promise<PaginatedProducts> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;
  const skip = (page - 1) * limit;

  const filter: FilterQuery<IProduct> = {};

  if (params.category) {
    filter.category = params.category.toLowerCase();
  }

  if (params.search) {
    filter.$text = { $search: params.search };
  }

  let sortOption: Record<string, SortOrder> = { createdAt: -1 };

  switch (params.sort) {
    case "price_asc":
      sortOption = { price: 1 };
      break;
    case "price_desc":
      sortOption = { price: -1 };
      break;
    case "newest":
      sortOption = { createdAt: -1 };
      break;
    case "name":
      sortOption = { name: 1 };
      break;
  }

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products: serializeMany<IProduct>(products),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getProductById(id: string): Promise<IProduct> {
  const product = await Product.findById(id).lean();
  if (!product) {
    throw AppError.notFound("Product");
  }
  return serialize<IProduct>(product) as IProduct;
}

export async function getCategories(): Promise<string[]> {
  const categories = await Product.distinct("category");
  return categories.sort();
}
