import React, { createContext, useContext, useState } from "react";

const WishContext = createContext();

export const WishProvider = ({ children }) => {
  const [wishCount, setwishCount] = useState(10);

  const handleWishCountChange = (count) => {
    setwishCount(count);
  };

  return <WishContext.Provider value={{ wishCount, handleWishCountChange }}>{children}</WishContext.Provider>;
};

export const useWish = () => useContext(WishContext);
