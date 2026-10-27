// @ts-check
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

import { Buffer } from "buffer";
import { startPermissionCheck } from "./registerPushNotification";
import { api, setAuthToken } from "../../utils/api";
import { STORAGE_KEYS, userProfileKey } from "../../constants/storageKeys";
import { ROLES } from "../../constants/roles";
import logger from "../../utils/logger";

global.atob = (input) => Buffer.from(input, "base64").toString("utf-8");
global.btoa = (input) => Buffer.from(input, "utf-8").toString("base64");

const AuthContext = createContext();

// Bearer JWT lives in SecureStore (Keystore/Keychain-backed); only the
// non-secret profile blob stays in AsyncStorage (MB-SEC-001).
const TOKEN_KEY = "auth.token";

const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [userLogin, setUserLogin] = useState(false);

  const clearStoredSession = async (userProfileStorageKey) => {
    setAuthToken(null);
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      logger.error("Failed to delete auth token:", error);
    }
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
    if (userProfileStorageKey) {
      await AsyncStorage.removeItem(userProfileStorageKey);
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
    } catch (_error) {
      return null;
    }
  };

  const checkExistingUser = async () => {
    try {
      const id = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!id) {
        return;
      }

      const userId = userProfileKey(JSON.parse(id));
      const currentUser = await AsyncStorage.getItem(userId);
      if (!currentUser) {
        logger.log("User data not available");
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
          logger.error("Failed to migrate auth token to SecureStore:", error);
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

      // Apply the bearer header before the state flush so effect-driven
      // authenticated calls never dispatch without it (legacy renderer
      // commits each setState immediately inside async functions).
      setAuthToken(token);
      setUserData({ ...parsedData, TOKEN: token });
      setUserLogin(true);
    } catch (error) {
      logger.error("Error retrieving data:", error);
    }
  };

  const login = async (data) => {
    const { TOKEN, ...profile } = data || {};

    if (TOKEN) {
      setAuthToken(TOKEN);
      try {
        await SecureStore.setItemAsync(TOKEN_KEY, TOKEN);
      } catch (error) {
        logger.error("Failed to store auth token securely:", error);
      }
    }

    setUserData(data);
    setUserLogin(true);

    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, JSON.stringify(data?._id));
    await AsyncStorage.setItem(userProfileKey(data?._id), JSON.stringify(profile));
  };

  const logout = async () => {
    setUserData(null);
    setUserLogin(false);
    await clearStoredSession(userProfileKey(userData?._id));
  };

  const userLogout = () => {
    logout();
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- legacy sync-state pattern kept to preserve behavior
    checkExistingUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional minimal dep set to avoid refetch loops
  }, []);

  useEffect(() => {
    if (userData?._id) {
      startPermissionCheck();
    }
  }, [userData]);

  // Drop the session when the backend rejects our bearer token (MB-SEC-010).
  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401 && userData?.TOKEN) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptorId);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional minimal dep set to avoid refetch loops
  }, [userData]);

  const updateUserData = async (updatedData) => {
    if (!updatedData || typeof updatedData !== "object") {
      logger.error("Invalid user data:", updatedData);
      return;
    }

    // Keep the in-memory token if the caller did not supply one.
    const merged = updatedData.TOKEN ? updatedData : { ...updatedData, TOKEN: userData?.TOKEN };
    setUserData(merged);

    try {
      const { TOKEN: _stripped, ...profile } = merged;
      await AsyncStorage.setItem(userProfileKey(updatedData._id), JSON.stringify(profile));
    } catch (error) {
      logger.error("Error saving user data to AsyncStorage:", error);
    }
  };

  // Utility function to check user's role
  const hasRole = (requiredRole) => {
    if (!requiredRole || !userData?.TOKEN) {
      return false;
    }

    try {
      const decodedToken = jwtDecode(userData.TOKEN);
      const userRole = decodedToken?.role || ROLES.CUSTOMER;

      return userRole === requiredRole;
    } catch (error) {
      logger.error("Invalid token, cannot decode:", error);
      return false;
    }
  };

  const getRole = (data) => {
    if (!data?.TOKEN) {
      return ROLES.CUSTOMER;
    }

    try {
      const decodedToken = jwtDecode(data.TOKEN);
      // Backend signs the `role` claim (MB-SEC-013 / X-SEC-005).
      return decodedToken?.role || ROLES.CUSTOMER;
    } catch (error) {
      logger.error("Invalid token, cannot decode:", error);
      return ROLES.CUSTOMER;
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
