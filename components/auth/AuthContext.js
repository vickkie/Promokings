// @ts-check
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { Buffer } from "buffer";
import { startPermissionCheck } from "./registerPushNotification";

global.atob = (input) => Buffer.from(input, "base64").toString("utf-8");
global.btoa = (input) => Buffer.from(input, "utf-8").toString("base64");

const AuthContext = createContext();

// Bearer JWT lives in SecureStore (Keystore/Keychain-backed); only the
// non-secret profile blob stays in AsyncStorage (MB-SEC-001).
const TOKEN_KEY = "auth.token";

const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [userLogin, setUserLogin] = useState(false);

  useEffect(() => {
    checkExistingUser();
  }, []);

  useEffect(() => {
    if (userData?._id) {
      startPermissionCheck();
    }
  }, [userData]);

  // Drop the session when the backend rejects our bearer token (MB-SEC-010).
  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401 && userData?.TOKEN) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptorId);
  }, [userData]);

  const clearStoredSession = async (userId) => {
    delete axios.defaults.headers.common["Authorization"];
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Failed to delete auth token:", error);
    }
    await AsyncStorage.removeItem("id");
    if (userId) {
      await AsyncStorage.removeItem(userId);
    }
  };

  // Returns the decoded token, or null when undecodable/expired (MB-SEC-010).
  const decodeValidToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      if (!decoded?.exp || decoded.exp * 1000 <= Date.now()) {
        return null;
      }
      return decoded;
    } catch (error) {
      return null;
    }
  };

  const checkExistingUser = async () => {
    try {
      const id = await AsyncStorage.getItem("id");
      if (!id) {
        return;
      }

      const userId = `user${JSON.parse(id)}`;
      const currentUser = await AsyncStorage.getItem(userId);
      if (!currentUser) {
        console.log("User data not available");
        return;
      }

      let parsedData = JSON.parse(currentUser);
      let token = await SecureStore.getItemAsync(TOKEN_KEY);

      // One-time migration: legacy builds stored the TOKEN inside the
      // AsyncStorage user blob. Move it to SecureStore, then strip it
      // from the plaintext profile.
      if (!token && parsedData?.TOKEN) {
        token = parsedData.TOKEN;
        try {
          await SecureStore.setItemAsync(TOKEN_KEY, token);
        } catch (error) {
          console.error("Failed to migrate auth token to SecureStore:", error);
        }
      }

      if (parsedData?.TOKEN) {
        const { TOKEN: _stripped, ...profile } = parsedData;
        parsedData = profile;
        await AsyncStorage.setItem(userId, JSON.stringify(profile));
      }

      if (!token) {
        // No credential to resume the session with.
        await clearStoredSession(userId);
        return;
      }

      if (!decodeValidToken(token)) {
        // Stale/forged token: drop it instead of re-sending it on every call.
        await clearStoredSession(userId);
        setUserData(null);
        setUserLogin(false);
        return;
      }

      setUserData({ ...parsedData, TOKEN: token });
      setUserLogin(true);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      console.log("Error retrieving data:", error);
    }
  };

  const login = async (data) => {
    const { TOKEN, ...profile } = data || {};

    setUserData(data);
    setUserLogin(true);

    if (TOKEN) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${TOKEN}`;
      try {
        await SecureStore.setItemAsync(TOKEN_KEY, TOKEN);
      } catch (error) {
        console.error("Failed to store auth token securely:", error);
      }
    }

    await AsyncStorage.setItem("id", JSON.stringify(data?._id));
    await AsyncStorage.setItem(`user${data?._id}`, JSON.stringify(profile));
  };

  const logout = async () => {
    setUserData(null);
    setUserLogin(false);
    await clearStoredSession(`user${userData?._id}`);
  };

  const userLogout = () => {
    logout();
  };

  const updateUserData = async (updatedData) => {
    if (!updatedData || typeof updatedData !== "object") {
      console.error("Invalid user data:", updatedData);
      return;
    }

    // Keep the in-memory token if the caller did not supply one.
    const merged = updatedData.TOKEN ? updatedData : { ...updatedData, TOKEN: userData?.TOKEN };
    setUserData(merged);

    try {
      const { TOKEN: _stripped, ...profile } = merged;
      await AsyncStorage.setItem(`user${updatedData._id}`, JSON.stringify(profile));
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
    if (!data?.TOKEN) {
      return "customer";
    }

    try {
      const decodedToken = jwtDecode(data.TOKEN);
      // Backend signs the `role` claim (MB-SEC-013 / X-SEC-005).
      return decodedToken?.role || "customer";
    } catch (error) {
      console.error("Invalid token, cannot decode:", error);
      return "customer";
    }
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
