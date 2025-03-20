import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { BACKEND_PORT } from "@env";
import axios from "axios";
import axiosRetry from "axios-retry";

// Configure axios to retry failed requests 3 times
axiosRetry(axios, { retries: 3 });

export async function registerForPushNotificationsAsync(userId) {
  if (!Device.isDevice) {
    console.log("Must use physical device for push notifications");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token for push notification");
    return;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  console.log("Expo Push Token:", token);

  try {
    const response = await axios.post(`${BACKEND_PORT}/api/notification/updatePushToken`, {
      userId,
      expoPushToken: token,
    });

    console.log("Response after token update", response.data);
    console.log("Push token updated successfully", response.data);
  } catch (err) {
    console.error("Error updating push token:", err);
  }
}
