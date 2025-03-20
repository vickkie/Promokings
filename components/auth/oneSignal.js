import React, { useEffect, useContext } from "react";
import Constants from "expo-constants";
import { OneSignal } from "react-native-onesignal";
import { BACKEND_PORT, ONESIGNAL_APP_ID } from "@env";
import { AuthContext } from "./AuthContext";

export default function OneSignalId() {
  const { userData } = useContext(AuthContext);

  // Using fallback ID ensures initialization even if env variable isn't set
  const OnesignalId = ONESIGNAL_APP_ID || "0dadac55-ed3d-4b98-8e25-1d4aa685ef06";

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
        .catch((err) => {
          console.error("Failed to get device state:", err);
        });
    } catch (err) {
      console.error("OneSignal initialization failed:", err);
    }
  }, [userData]);

  return null;
}
