import { storage } from "./utils/storage";

// ✅ Add to Cart
export const addToCart = (cartItemId, quantity = 1, size = "M") => {
  const allowedSizes = ["XS", "S", "M", "L", "XL"];
  const validatedSize = allowedSizes.includes(size) ? size : "M";

  // Get existing cart from storage
  let cart = JSON.parse(storage.getString("cart") || "[]");

  // Check if product already exists in cart
  const existingProduct = cart.find((item) => item.cartItemId === cartItemId && item.size === validatedSize);

  if (existingProduct) {
    existingProduct.quantity += quantity;
  } else {
    cart.push({ cartItemId, quantity, size: validatedSize });
  }

  // Save updated cart
  storage.set("cart", JSON.stringify(cart));
};

// ✅ Get Cart Items
export const getCart = () => {
  return JSON.parse(storage.getString("cart") || "[]");
};

// ✅ Remove a Cart Item
export const removeFromCart = (cartItemId) => {
  let cart = getCart();
  cart = cart.filter((item) => item.cartItemId !== cartItemId);
  storage.set("cart", JSON.stringify(cart));
};

// ✅ Increment Quantity
export const incrementCartItem = (cartItemId) => {
  let cart = getCart();
  cart = cart.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item));
  storage.set("cart", JSON.stringify(cart));
};

// ✅ Decrement Quantity
export const decrementCartItem = (cartItemId) => {
  let cart = getCart();
  cart = cart
    .map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item))
    .filter((item) => item.quantity > 0);
  storage.set("cart", JSON.stringify(cart));
};
