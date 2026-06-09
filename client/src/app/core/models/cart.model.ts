import { Product } from './product.model';

/**
 * Cart item with the product field populated and serialized by the backend.
 * The `id` field is the cart item's own ID (used for update/delete operations),
 * distinct from `product.id` which is the product's ID.
 */
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  user: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}
