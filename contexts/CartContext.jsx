import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { setItem, getItem } from "../utils/storage";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const saveTimeout = useRef(null);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await getItem("cart");
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            setCart(parsedCart);
          }
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    };

    loadCart();
  }, []);

  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      setItem("cart", JSON.stringify(cart));
    }, 300); // debounce delay
  }, [cart]);

  const addToCart = (product) => {
    if (!product || !product.id) {
      console.error("Invalid product:", product);
      return;
    }

    setCart((prevCart) => {
      const index = prevCart.findIndex((item) => item.id === product.id && item.size === product.size);

      if (index !== -1) {
        const updated = [...prevCart];
        updated[index].quantity += product.quantity || 1;
        return updated;
      }

      return [...prevCart, { ...product, quantity: product.quantity || 1 }];
    });
  };

  const removeFromCart = (id, size) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === id && item.size === size)));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
