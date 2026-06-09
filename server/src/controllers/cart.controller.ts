import { Response } from "express";
import * as cartService from "../services/cart.service";
import { asyncHandler } from "../utils/async-handler";
import { AuthenticatedRequest, ApiResponse } from "../types";

export const getCart = asyncHandler(
  async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const cart = await cartService.getCart(req.user!.userId);

    res.status(200).json({
      success: true,
      data: cart,
    });
  },
);

export const addToCart = asyncHandler(
  async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(
      req.user!.userId,
      productId,
      quantity,
    );

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: cart,
    });
  },
);

export const updateCartItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { quantity } = req.body;
    const cart = await cartService.updateCartItem(
      req.user!.userId,
      req.params.id,
      quantity,
    );

    res.status(200).json({
      success: true,
      data: cart,
    });
  },
);

export const removeCartItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const cart = await cartService.removeCartItem(
      req.user!.userId,
      req.params.id,
    );

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: cart,
    });
  },
);
