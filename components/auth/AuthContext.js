import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

    console.log(data);
    setUserLogin(true);
    await AsyncStorage.setItem("id", JSON.stringify(data._id));
    await AsyncStorage.setItem(`user${data._id}`, JSON.stringify(data));
  };

  const logout = async () => {
    setUserData(null);
    setUserLogin(false);
    await AsyncStorage.removeItem("id");
  };

  const userLogout = () => {
    logout();
  };

  const updateUserData = async (updatedData) => {
    setUserData(updatedData);
    await AsyncStorage.setItem(`user${updatedData._id}`, JSON.stringify(updatedData));
  };

  const authContextValue = {
    userData,
    userLogin,
    userLogout,
    login,
    logout,
    updateUserData,
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
