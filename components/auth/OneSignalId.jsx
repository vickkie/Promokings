import  { useEffect, useContext, useRef } from "react";
import Constants from "expo-constants";
import { OneSignal } from "react-native-onesignal";
import axios from "axios";
import { BACKEND_PORT, ONESIGNAL_APP_ID } from "@env";
import { AuthContext } from "./AuthContext";

// react-native-onesignal@5.x API (replaces the 4.x setAppId/getDeviceState
// flow removed in 643327c): initialize(appId) once, login(externalId) to
// bind the device to the user, and the subscription id lives on
// OneSignal.User.pushSubscription.
// Env-only ONESIGNAL_APP_ID, fails closed when unset (MB-SEC-003).
let oneSignalInitialized = false;

export default function OneSignalId() {
  const { userData } = useContext(AuthContext);
  const lastPostedRef = useRef(null);

  useEffect(() => {
    // Early return if user isn't logged in
    if (!userData?._id) {
      return;
    }

    // Skip initialization in Expo Go (no native module)
    if (Constants.appOwnership === "expo") {
      console.log("Running in Expo Go; skipping OneSignal initialization");
      return;
    }

    // Fail closed when the app id is not configured
    if (!ONESIGNAL_APP_ID) {
      console.warn("ONESIGNAL_APP_ID not configured; skipping OneSignal initialization");
      return;
    }

    const userId = userData._id;

    try {
      if (!oneSignalInitialized) {
        OneSignal.initialize(ONESIGNAL_APP_ID);
        oneSignalInitialized = true;
      }
      OneSignal.login(userId);
    } catch (err) {
      console.error("OneSignal initialization failed:", err);
      return;
    }

    const postSubscriptionId = async (onesignalId) => {
      const key = `${userId}:${onesignalId}`;
      if (!onesignalId || lastPostedRef.current === key) {
        return;
      }
      lastPostedRef.current = key;
      try {
        // Global Bearer header is set by AuthContext on login.
        await axios.post(`${BACKEND_PORT}/api/notification/updateOneSignal`, {
          userId,
          onesignalId,
        });
      } catch (err) {
        lastPostedRef.current = null;
        console.error("Error updating OneSignal ID:", err);
      }
    };

    const onSubscriptionChange = (event) => {
      postSubscriptionId(event?.current?.id);
    };

    OneSignal.User.pushSubscription.addEventListener("change", onSubscriptionChange);
    OneSignal.User.pushSubscription.getIdAsync()
      .then((id) => postSubscriptionId(id))
      .catch((err) => console.error("Failed to get OneSignal subscription id:", err));

    return () => {
      OneSignal.User.pushSubscription.removeEventListener("change", onSubscriptionChange);
      if (oneSignalInitialized) {
        OneSignal.logout();
      }
    };
  }, [userData?._id]);

  return null;
}
