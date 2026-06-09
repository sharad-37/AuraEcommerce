/**
 * Cart business logic.
 *
 * Key design decision: Cart prices are snapshotted from the product at add-time.
 * This means the cart reflects the price when the user added the item.
 * At checkout, we re-validate prices against current product prices.
 *
 * Why serialize cart responses?
 * Populated subdocuments (cart.items.product) have nested _id fields that
 * need transformation. The serializer recursively handles all _id → id
 * conversions across the entire response object.
 */

import { Cart, Product } from "../models";
import { AppError } from "../utils/app-error";
import { serialize } from "../utils/serializer";
import { ICart } from "../types";
import { Types } from "mongoose";

async function fetchCart(userId: string): Promise<ICart | null> {
  const cart = await Cart.findOne({ user: userId })
    .populate("items.product", "name image price stock category description")
    .lean();
  return cart ? serialize<ICart>(cart) : null;
}

export async function getCart(userId: string): Promise<ICart | null> {
  return fetchCart(userId);
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number,
): Promise<ICart> {
  const product = await Product.findById(productId);
  if (!product) {
    throw AppError.notFound("Product");
  }

  if (product.stock < quantity) {
    throw AppError.badRequest(`Only ${product.stock} items available in stock`);
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [
        {
          product: new Types.ObjectId(productId),
          quantity,
          price: product.price,
        },
      ],
    });
  } else {
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      if (newQuantity > product.stock) {
        throw AppError.badRequest(
          `Only ${product.stock} items available in stock`,
        );
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = product.price;
    } else {
      cart.items.push({
        product: new Types.ObjectId(productId),
        quantity,
        price: product.price,
      } as ICart["items"][0]);
    }

    await cart.save();
  }

  return fetchCart(userId) as Promise<ICart>;
}

export async function updateCartItem(
  userId: string,
  itemId: string,
  quantity: number,
): Promise<ICart> {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw AppError.notFound("Cart");
  }

  const item = cart.items.find((i) => i._id?.toString() === itemId);
  if (!item) {
    throw AppError.notFound("Cart item");
  }

  const product = await Product.findById(item.product);
  if (!product) {
    throw AppError.notFound("Product");
  }

  if (quantity > product.stock) {
    throw AppError.badRequest(`Only ${product.stock} items available in stock`);
  }

  item.quantity = quantity;
  item.price = product.price;
  await cart.save();

  return fetchCart(userId) as Promise<ICart>;
}

export async function removeCartItem(
  userId: string,
  itemId: string,
): Promise<ICart | null> {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw AppError.notFound("Cart");
  }

  cart.items = cart.items.filter(
    (item) => item._id?.toString() !== itemId,
  ) as typeof cart.items;
  await cart.save();

  return fetchCart(userId);
}

export async function clearCart(userId: string): Promise<void> {
  await Cart.findOneAndDelete({ user: userId });
}
