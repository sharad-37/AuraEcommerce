import { Request, Response } from "express";
import * as productService from "../services/product.service";
import { asyncHandler } from "../utils/async-handler";
import { ApiResponse, PaginatedResponse, IProduct } from "../types";

export const getProducts = asyncHandler(
  async (req: Request, res: Response<PaginatedResponse<IProduct>>) => {
    const result = await productService.getProducts({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      category: req.query.category as string | undefined,
      search: req.query.search as string | undefined,
      sort: req.query.sort as string | undefined,
    });

    res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  },
);

export const getProductById = asyncHandler(
  async (req: Request, res: Response<ApiResponse>) => {
    const product = await productService.getProductById(String(req.params.id));

    res.status(200).json({
      success: true,
      data: product,
    });
  },
);

export const getCategories = asyncHandler(
  async (_req: Request, res: Response<ApiResponse>) => {
    const categories = await productService.getCategories();

    res.status(200).json({
      success: true,
      data: categories,
    });
  },
);
