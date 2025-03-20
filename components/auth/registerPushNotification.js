import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_PORT } from "@env";
import axios from "axios";
import axiosRetry from "axios-retry";

// Configure axios to retry failed requests 3 times
axiosRetry(axios, { retries: 3 });

export async function registerForPushNotificationsAsync(userId) {
  if (!Device.isDevice) {
    console.log("Must use a physical device for push notifications");
    return;
  }

  // Check last permission request time
  const lastCheck = await AsyncStorage.getItem("lastNotificationPermissionCheck");
  const now = Date.now();
  const CHECK_INTERVAL = 60000; // 1 minute (to prevent spam)

  if (lastCheck && now - parseInt(lastCheck) < CHECK_INTERVAL) {
    console.log("Skipping permission check: Checked recently.");
    return;
  }

  let { status } = await Notifications.getPermissionsAsync();

  if (Platform.OS === "android" && Platform.Version >= 33) {
    if (status !== "granted") {
      const { status: androidStatus } = await Notifications.requestPermissionsAsync();
      status = androidStatus;
    }
  } else if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    status = newStatus;
  }

  if (status !== "granted") {
    console.log("Failed to get push token for push notification");
    return;
  }

  console.log("Notification permission granted:", status);

  await AsyncStorage.setItem("lastNotificationPermissionCheck", now.toString()); // Save check time

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  console.log("Expo Push Token:", token);

  try {
    const response = await axios.post(`${BACKEND_PORT}/api/notification/updatePushToken`, {
      userId,
      expoPushToken: token,
    });

    console.log("Push token updated successfully", response.data);
  } catch (err) {
    console.error("Error updating push token:", err);
  }
}

export function startPermissionCheck(userId) {
  const interval = setInterval(async () => {
    console.log("Checking notification permission...");

    const { status } = await Notifications.getPermissionsAsync();

    if (status === "granted") {
      console.log("✅ Permission granted, stopping checks.");
      clearInterval(interval);
      registerForPushNotificationsAsync(userId);
    } else if (status === "denied") {
      console.log("❌ Permission denied. User needs to enable manually.");
    } else {
      console.log("⚠️ Permission status is unknown or not determined yet.");
    }
  }, 30000); // Every 30 seconds
}
