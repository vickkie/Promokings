import React, { createContext, useContext, useState, useEffect } from "react";
import { storage, setItem, getItem } from "../utils/storage";

const WishContext = createContext();

export const WishProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from AsyncStorage when the app starts
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const savedWishlist = await getItem("wishlist");
        setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []); // 🛠️ Parse stored data
      } catch (error) {
        console.error("Failed to load wishlist:", error);
      }
    };
    loadWishlist();
  }, []);

  // Save wishlist to AsyncStorage when it changes (debounced)
  useEffect(() => {
    const saveWishlist = setTimeout(() => {
      setItem("wishlist", JSON.stringify(wishlist));
    }, 200); // Debounce writes to avoid excessive calls

    return () => clearTimeout(saveWishlist);
  }, [wishlist]);

  // ✅ Prevents duplicates, only adds if not already in the wishlist
  const addToWishlist = (product) => {
    if (!product || typeof product !== "object" || !product.id) {
      console.error("Invalid product added to wishlist:", product);
      return;
    }

    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((item) => item.id === product.id && item.size === product.size);
      return exists ? prevWishlist : [...prevWishlist, product];
    });
  };

  const removeFromWishlist = (id, size) => {
    setWishlist((prevWishlist) => prevWishlist.filter((item) => !(item.id === id && item.size === size)));
  };

  const clearWishlist = () => setWishlist([]);

  const wishCount = wishlist.length;

  return (
    <WishContext.Provider value={{ wishlist, wishCount, addToWishlist, removeFromWishlist, clearWishlist }}>
      {children}
    </WishContext.Provider>
  );
};

export const useWish = () => useContext(WishContext);
