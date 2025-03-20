import React, { useEffect, useContext } from "react";
import Constants from "expo-constants";
import OneSignal from "react-native-onesignal";
import { BACKEND_PORT, ONESIGNAL_APP_ID } from "@env";
import { AuthContext } from "./AuthContext";
import { Platform, PermissionsAndroid } from "react-native";

const requestAndroidNotificationPermission = async () => {
  if (Platform.OS === "android" && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Notification permission granted");
        OneSignal.promptForPushNotificationsWithUserResponse();
      } else {
        console.log("Notification permission denied");
      }
    } catch (err) {
      console.warn("Permission request error:", err);
    }
  } else {
    // iOS & lower Android versions
    OneSignal.promptForPushNotificationsWithUserResponse();
  }
};

export default function OneSignalId() {
  const { userData } = useContext(AuthContext);
  const OnesignalId = ONESIGNAL_APP_ID || "0dadac55-ed3d-4b98-8e25-1d4aa685ef06";

  useEffect(() => {
    if (!userData || !userData._id) {
      console.log("User not logged in; skipping OneSignal update");
      return;
    }

    if (Constants.appOwnership === "expo") {
      console.log("Running in Expo Go; skipping OneSignal initialization");
      return;
    }

    try {
      // Initialize OneSignal before requesting permissions
      OneSignal.setAppId(OnesignalId);

      // Request permission (optimized)
      requestAndroidNotificationPermission();

      // Get device state
      OneSignal.getDeviceState()
        .then((deviceState) => {
          const playerId = deviceState?.userId;
          if (!playerId) {
            console.warn("Failed to obtain OneSignal player ID");
            return;
          }

          console.log("OneSignal Player ID:", playerId);

          // Update backend with player ID
          fetch(`${BACKEND_PORT}/api/notification/updateOneSignal`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userData._id, onesignalId: playerId }),
          })
            .then((res) => res.json())
            .then((data) => console.log("Updated OneSignal ID:", data))
            .catch((err) => console.error("Error updating OneSignal ID:", err));
        })
        .catch((err) => console.error("Failed to get device state:", err));
    } catch (err) {
      console.error("OneSignal initialization failed:", err);
    }
  }, [userData]);

  return null;
}
