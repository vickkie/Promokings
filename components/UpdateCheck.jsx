import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import NetInfo from "@react-native-community/netinfo";
import { BACKEND_PORT } from "@env";

const CHECK_UPDATE_URL = `${BACKEND_PORT}/api/version/latest`;
const SKIPPED_VERSION_KEY = "skipped_version";
const CHECK_INTERVAL = 120000; // 2 minutes

export default function UpdateCheck() {
  const [updateUrl, setUpdateUrl] = useState("");
  const [isForced, setIsForced] = useState(false);
  const [latestVersion, setLatestVersion] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  // Use applicationVersion for standalone builds, fallback to "dev" in development
  const currentVersion = Application.applicationVersion || "dev";

  useEffect(() => {
    checkForUpdates();
    const interval = setInterval(checkForUpdates, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      const { isConnected } = await NetInfo.fetch();
      if (!isConnected) {
        console.log("No internet connection, skipping update check.");
        return;
      }

      const response = await fetch(CHECK_UPDATE_URL);
      const data = await response.json();

      const newVersion = data.version;
      setLatestVersion(newVersion);

      const skippedVersion = await AsyncStorage.getItem(SKIPPED_VERSION_KEY);

      if (currentVersion !== newVersion && skippedVersion !== newVersion) {
        setUpdateUrl(data.downloadUrl || "https://play.google.com/store/apps/details?id=com.uzitrake.promokings");
        setIsForced(data.forceUpdate);
        showUpdateAlert(data.forceUpdate, newVersion);
      }
    } catch (error) {
      console.error("Error checking update:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const showUpdateAlert = (force, newVersion) => {
    const allowSkip = currentVersion === "dev" || !force; // Skip allowed in dev or if not forced

    Alert.alert(
      "Update Available",
      `A new version of the app is available.\n\nCurrent: ${currentVersion}\nLatest: ${newVersion}\n\nPlease update to continue.`,
      [
        { text: "Update Now", onPress: () => updateUrl && openStore(updateUrl) },
        ...(allowSkip ? [{ text: "Skip", onPress: skipUpdate }] : []),
      ],
      { cancelable: false }
    );
  };

  const skipUpdate = async () => {
    if (latestVersion) {
      await AsyncStorage.setItem(SKIPPED_VERSION_KEY, latestVersion);
    }
  };

  const openStore = (url) => {
    Linking.openURL(url).catch((err) => console.error("Failed to open store:", err));
  };

  return;
}
