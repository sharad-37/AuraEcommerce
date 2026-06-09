/**
 * Centralized type definitions for the application.
 *
 * Separating types into a dedicated module ensures:
 * - Models, controllers, and services share consistent interfaces
 * - Changes to data shapes are reflected across all layers
 * - Express Request augmentation is done in one place
 */

import { Request } from "express";
import { Document, Types } from "mongoose";

// ─── User Types ──────────────────────────────────────────────

export enum UserRole {
  CUSTOMER = "customer",
  ADMIN = "admin",
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ─── Product Types ───────────────────────────────────────────

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Cart Types ──────────────────────────────────────────────

export interface ICartItem {
  product: Types.ObjectId | IProduct;
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Order Types ─────────────────────────────────────────────

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export interface IOrderItem {
  product: Types.ObjectId | IProduct;
  name: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  customerName: string;
  address: string;
  mobile: string;
  items: IOrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Auth Types ──────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// ─── API Response Types ──────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
