import React, { useEffect, useContext } from "react";
import Constants from "expo-constants";
import { OneSignal } from "react-native-onesignal";
import axios from "axios";
import { BACKEND_PORT, ONESIGNAL_APP_ID } from "@env";
import { AuthContext } from "./AuthContext";

export default function OneSignalId() {
  const { userData } = useContext(AuthContext);

  // Env-only: no hardcoded tenant fallback (MB-SEC-003)
  const OnesignalId = ONESIGNAL_APP_ID;

  useEffect(() => {
    // Early return if user isn't logged in
    if (!userData || !userData._id) {
      console.log("User not logged in; skipping OneSignal update");
      return;
    }

    // Skip initialization in Expo Go
    if (Constants.appOwnership === "expo") {
      console.log("Running in Expo Go; skipping OneSignal initialization");
      return;
    }

    // Fail closed when the app id is not configured
    if (!OnesignalId) {
      console.warn("ONESIGNAL_APP_ID not configured; skipping OneSignal initialization");
      return;
    }

    try {
      // Initialize OneSignal
      OneSignal.setAppId(OnesignalId);

      // Get device state
      OneSignal.getDeviceState()
        .then((deviceState) => {
          const playerId = deviceState?.userId;

          if (!playerId) {
            console.warn("Failed to obtain OneSignal player ID");
            return;
          }

          // Update backend with player ID (axios carries the global Bearer header)
          axios
            .post(`${BACKEND_PORT}/api/notification/updateOneSignal`, {
              userId: userData._id,
              onesignalId: playerId,
            })
            .catch((err) => console.error("Error updating OneSignal ID:", err));
        })
        .catch((err) => {
          console.error("Failed to get device state:", err);
        });
    } catch (err) {
      console.error("OneSignal initialization failed:", err);
    }
  }, [userData]);

  return null;
}
