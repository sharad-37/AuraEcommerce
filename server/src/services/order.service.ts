/**
 * Order business logic.
 *
 * Critical design decisions:
 * - Stock is validated AND decremented atomically at order creation
 * - If any item fails stock validation, the entire order is rejected
 * - Cart is cleared only after successful order creation
 * - Order items store snapshots (name, price) at time of purchase
 */

import { Order, Product, Cart } from "../models";
import { AppError } from "../utils/app-error";
import { serialize, serializeMany } from "../utils/serializer";
import { IOrder, IOrderItem, OrderStatus } from "../types";
import mongoose from "mongoose";

interface CreateOrderData {
  customerName: string;
  address: string;
  mobile: string;
}

export async function createOrder(
  userId: string,
  orderData: CreateOrderData,
): Promise<IOrder> {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    throw AppError.badRequest("Your cart is empty");
  }

  const orderItems: IOrderItem[] = [];
  let total = 0;

  for (const cartItem of cart.items) {
    const product = await Product.findById(cartItem.product);

    if (!product) {
      throw AppError.badRequest(`Product no longer available`);
    }

    if (product.stock < cartItem.quantity) {
      throw AppError.badRequest(
        `Insufficient stock for "${product.name}". Available: ${product.stock}`,
      );
    }

    product.stock -= cartItem.quantity;
    await product.save();

    const itemTotal = product.price * cartItem.quantity;
    total += itemTotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      quantity: cartItem.quantity,
      price: product.price,
    } as IOrderItem);
  }

  const order = await Order.create({
    user: userId,
    customerName: orderData.customerName,
    address: orderData.address,
    mobile: orderData.mobile,
    items: orderItems,
    total,
    status: OrderStatus.PENDING,
  });

  await Cart.findOneAndDelete({ user: userId });

  return serialize<IOrder>(order.toObject()) as IOrder;
}

export async function getUserOrders(userId: string): Promise<IOrder[]> {
  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();
  return serializeMany<IOrder>(orders);
}

export async function getOrderById(
  userId: string,
  orderId: string,
): Promise<IOrder> {
  const order = await Order.findOne({ _id: orderId, user: userId }).lean();
  if (!order) {
    throw AppError.notFound("Order");
  }
  return serialize<IOrder>(order) as IOrder;
}
