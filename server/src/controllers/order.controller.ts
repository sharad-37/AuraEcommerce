import { Response } from "express";
import * as orderService from "../services/order.service";
import { asyncHandler } from "../utils/async-handler";
import { AuthenticatedRequest, ApiResponse } from "../types";

export const createOrder = asyncHandler(
  async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { customerName, address, mobile } = req.body;
    const order = await orderService.createOrder(req.user!.userId, {
      customerName,
      address,
      mobile,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  },
);

export const getOrders = asyncHandler(
  async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const orders = await orderService.getUserOrders(req.user!.userId);

    res.status(200).json({
      success: true,
      data: orders,
    });
  },
);

export const getOrderById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const order = await orderService.getOrderById(
      req.user!.userId,
      req.params.id,
    );

    res.status(200).json({
      success: true,
      data: order,
    });
  },
);
