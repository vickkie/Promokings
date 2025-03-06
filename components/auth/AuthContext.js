import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { jwtDecode } from "jwt-decode";

import atob from "core-js-pure/stable/atob";
import btoa from "core-js-pure/stable/btoa";

global.atob = atob;
global.btoa = btoa;

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [userLogin, setUserLogin] = useState(false);

  useEffect(() => {
    checkExistingUser();
  }, []);

  const checkExistingUser = async () => {
    try {
      const id = await AsyncStorage.getItem("id");
      if (id) {
        const userId = `user${JSON.parse(id)}`;
        const currentUser = await AsyncStorage.getItem(userId);
        if (currentUser) {
          const parsedData = JSON.parse(currentUser);
          setUserData(parsedData);
          setUserLogin(true);
        } else {
          console.log("User data not available");
        }
      }
    } catch (error) {
      console.log("Error retrieving data:", error);
    }
  };

  const login = async (data) => {
    setUserData(data);
    setUserLogin(true);

    await AsyncStorage.setItem("id", JSON.stringify(data?._id));

    await AsyncStorage.setItem(`user${data?._id}`, JSON.stringify(data));
  };

  const logout = async () => {
    setUserData(null);
    setUserLogin(false);
    // Clear AsyncStorage
    await AsyncStorage.clear();
  };

  const userLogout = () => {
    logout();
  };

  const updateUserData = async (updatedData) => {
    if (!updatedData || typeof updatedData !== "object") {
      console.error("Invalid user data:", updatedData);
      return;
    }

    setUserData(updatedData);

    try {
      const stringifiedData = JSON.stringify(updatedData);
      await AsyncStorage.setItem(`user${updatedData._id}`, stringifiedData);
    } catch (error) {
      console.error("Error saving user data to AsyncStorage:", error);
    }
  };

  // Utility function to check user's role
  const hasRole = (requiredRole) => {
    if (!requiredRole || !userData?.TOKEN) {
      return false;
    }

    try {
      const decodedToken = jwtDecode(userData.TOKEN);
      const userRole = decodedToken?.role || "customer";

      return userRole === requiredRole;
    } catch (error) {
      console.error("Invalid token, cannot decode:", error);
      return false;
    }
  };

  const getRole = (data) => {
    if (!data) {
      console.log("no user data");
      return "customer";
    }

    const decodedToken = jwtDecode(data?.TOKEN);

    const userRole = decodedToken.role || "customer";
    return userRole;
  };

  const authContextValue = {
    userData,
    userLogin,
    userLogout,
    login,
    logout,
    updateUserData,
    hasRole,
    getRole,
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
