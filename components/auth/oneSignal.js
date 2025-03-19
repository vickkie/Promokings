import React, { useEffect, useContext } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import OneSignal from "react-native-onesignal";
import { BACKEND_PORT, ONESIGNAL_APP_ID } from "@env";
import { AuthContext } from "./AuthContext";

export default function OneSignalId() {
  const { userData } = useContext(AuthContext);

  useEffect(() => {
    // Only run if userData is available (user is logged in)
    if (!userData || !userData._id) {
      console.log("User not logged in; skipping OneSignal update");
      return;
    }

    // Check if appOwnership is 'expo', which means it's running in Expo Go
    if (Constants.appOwnership === "expo") {
      console.log("Running in Expo Go; skipping OneSignal initialization");
      return;
    }

    OneSignal.setAppId(ONESIGNAL_APP_ID);
    OneSignal.promptForPushNotificationsWithUserResponse();

    OneSignal.getDeviceState().then((deviceState) => {
      const playerId = deviceState?.userId;
      console.log("OneSignal Player ID:", playerId);
      if (playerId) {
        fetch(`${BACKEND_PORT}/api/notification/updateOneSignal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userData._id, onesignalId: playerId }),
        })
          .then((res) => res.json())
          .then((data) => console.log("Updated OneSignal ID:", data))
          .catch((err) => console.error("Error updating OneSignal ID:", err));
      }
    });
  }, [userData]);

  return null;
}
