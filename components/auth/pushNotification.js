import { useEffect, useContext, useRef, useState } from "react";
import { Animated } from "react-native";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "./registerPushNotification";
import { AuthContext } from "./AuthContext";
import { useNavigation } from "@react-navigation/native";
import { View, Text, TouchableOpacity, Image, Vibration } from "react-native";
import * as Haptics from "expo-haptics";

// Ensure notifications are handled correctly
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function PushNotification() {
  const { userData } = useContext(AuthContext);
  const navigation = useNavigation();

  // Store listeners to prevent duplicate subscriptions
  const notificationListenerRef = useRef(null);
  const responseListenerRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const lastNotificationIdRef = useRef(null);

  // State for in-app notification banner
  const [notification, setNotification] = useState(null);

  const slideAnim = useRef(new Animated.Value(-100)).current; // Initial position

  useEffect(() => {
    if (!userData || !userData._id) return;

    registerForPushNotificationsAsync(userData._id);

    // Foreground notification handling
    if (!notificationListenerRef.current) {
      notificationListenerRef.current = Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification Received:", notification);

        // Avoid duplicate notifications
        if (lastNotificationIdRef.current === notification.request.identifier) {
          return;
        }
        lastNotificationIdRef.current = notification.request.identifier;

        setNotification(notification.request.content);

        // Haptic & vibration feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Vibration.vibrate();

        // Slide-in animation
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();

        // Clear previous timeout before setting a new one
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

        // Auto-hide after 8 seconds
        hideTimeoutRef.current = setTimeout(() => {
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setNotification(null));
        }, 8000);
      });
    }

    // Background/Clicked Notification Handling
    if (!responseListenerRef.current) {
      responseListenerRef.current = Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification Clicked:", response);
        const data = response.notification.request.content.data;
        if (data?.conversationId) {
          navigation?.navigate("ChatScreen", {
            conversationId: data.conversationId,
            chatWith: data?.chatWith,
          });
        }
      });
    }

    return () => {
      if (notificationListenerRef.current) {
        Notifications.removeNotificationSubscription(notificationListenerRef.current);
        notificationListenerRef.current = null;
      }
      if (responseListenerRef.current) {
        Notifications.removeNotificationSubscription(responseListenerRef.current);
        responseListenerRef.current = null;
      }
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [userData?._id]);

  return (
    <>
      {/* In-App Notification Banner */}
      {notification && (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: "#128C7E",
            padding: 12,
            flexDirection: "row",
            alignItems: "center",
            zIndex: 1000,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <TouchableOpacity
            onPress={() => {
              if (notification.data?.conversationId) {
                navigation.navigate("ChatScreen", {
                  conversationId: notification.data.conversationId,
                  chatWith: notification.data?.chatWith,
                });
              }
              setNotification(null); // Hide after tap
            }}
            style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
          >
            <Image
              source={
                notification.data?.avatar
                  ? { uri: notification.data.avatar }
                  : require("../../assets/images/userDefault.webp")
              }
              style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
            />

            <View>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>{notification.title}</Text>
              <Text style={{ color: "#fff" }}>{notification.body}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
  );
}
