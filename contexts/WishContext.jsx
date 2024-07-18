import React, { createContext, useContext, useState } from "react";

const WishContext = createContext();

export const WishProvider = ({ children }) => {
  const [wishCount, setwishCount] = useState(10);

  const handlewishCountChange = (count) => {
    setwishCount(count);
  };

  return <WishContext.Provider value={{ wishCount, handlewishCountChange }}>{children}</WishContext.Provider>;
};

export const useWish = () => useContext(WishContext);
