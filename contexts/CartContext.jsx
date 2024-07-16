import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [itemCount, setItemCount] = useState(0);

  const handleItemCountChange = (count) => {
    setItemCount(count);
  };

  return <CartContext.Provider value={{ itemCount, handleItemCountChange }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
