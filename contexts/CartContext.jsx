import React, { createContext, useContext, useState, useEffect } from "react";
import { storage, setItem, getItem } from "../utils/storage";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from AsyncStorage when the app starts
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await getItem("cart");
        setCart(savedCart ? JSON.parse(savedCart) : []); // 🛠️ Fix: Parse stored string
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    };
    loadCart();
  }, []);

  // Save cart to AsyncStorage when it changes (debounced)
  useEffect(() => {
    const saveCart = setTimeout(() => {
      setItem("cart", JSON.stringify(cart));
    }, 200); // Debounce save to avoid frequent writes

    return () => clearTimeout(saveCart);
  }, [cart]);

  // ✅ Prevents duplicate items and updates quantity instead
  const addToCart = (product) => {
    if (!product || typeof product !== "object" || !product.id) {
      console.error("Invalid product added to cart:", product);
      return;
    }

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.id === product.id && item.size === product.size);

      let updatedCart;
      if (existingItemIndex !== -1) {
        updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity =
          (updatedCart[existingItemIndex].quantity || 0) + (product.quantity || 1);
      } else {
        updatedCart = [...prevCart, { ...product, quantity: product.quantity || 1 }];
      }

      // console.log("Updated Cart:", JSON.stringify(updatedCart, null, 2));
      return updatedCart;
    });
  };

  const removeFromCart = (id, size) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === id && item.size === size)));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.length;

  return (
    <CartContext.Provider value={{ cart, cartCount, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
