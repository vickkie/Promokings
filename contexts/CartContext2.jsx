import React, { createContext, useContext, useState, useEffect } from "react";
import { storage, setItem, getItem } from "./utils/storage";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = getItem("cart") || [];
    setCart(savedCart);
  }, []);

  const addToCart = (product) => {
    const updatedCart = [...cart, product];
    setCart(updatedCart);
    setItem("cart", updatedCart);
  };

  const removeFromCart = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    setItem("cart", updatedCart);
  };

  const clearCart = () => {
    setCart([]);
    setItem("cart", []);
  };

  return <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
