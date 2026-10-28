import { useEffect, useContext, useRef, useState } from "react";
import { Animated , View, Text, TouchableOpacity, Image, Vibration } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { ensureNotificationPermission } from "./registerPushNotification";
import { AuthContext } from "./AuthContext";
import { useNavigation } from "@react-navigation/native";
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

  const [slideAnim] = useState(() => new Animated.Value(-160)); // Initial position

  useEffect(() => {
    if (!userData || !userData._id) return;

    ensureNotificationPermission();

    // Foreground notification handling
    if (!notificationListenerRef.current) {
      notificationListenerRef.current = Notifications.addNotificationReceivedListener((notification) => {
        // Avoid duplicate notifications
        if (lastNotificationIdRef.current === notification.request.identifier) {
          return;
        }
        lastNotificationIdRef.current = notification.request.identifier;

        // OneSignal delivers the message as raw FCM data: body lands in
        // data.alert and our custom payload sits JSON-encoded in data.custom
        // under key "a"; request.content fields stay null.
        const content = notification.request.content;
        const remoteData = notification.request.trigger?.remoteMessage?.data || {};
        let additionalData = content.data;
        if (!additionalData && typeof remoteData.custom === "string") {
          try {
            additionalData = JSON.parse(remoteData.custom)?.a || null;
          } catch {
            additionalData = null;
          }
        }

        setNotification({
          ...content,
          body: content.body ?? remoteData.alert ?? null,
          data: additionalData,
        });

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
            toValue: -160,
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
        const request = response.notification.request;
        let data = request.content.data;
        const remoteData = request.trigger?.remoteMessage?.data || {};
        if (!data && typeof remoteData.custom === "string") {
          try {
            data = JSON.parse(remoteData.custom)?.a || null;
          } catch {
            data = null;
          }
        }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional minimal dep set to avoid refetch loops
  }, [userData?._id]);

  return (
    <>
      {/* In-App Notification Banner */}
      {notification && (
        <Animated.View
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            right: 8,
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: 14,
            flexDirection: "row",
            alignItems: "flex-start",
            zIndex: 1000,
            elevation: 8,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
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
            style={{ flexDirection: "row", alignItems: "flex-start", flex: 1 }}
          >
            {notification.data?.avatar ? (
              <Image
                source={{ uri: notification.data.avatar }}
                style={{ width: 34, height: 34, borderRadius: 17, marginRight: 12, marginTop: 2 }}
              />
            ) : (
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "#111",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                  marginTop: 2,
                }}
              >
                <Ionicons name="notifications" size={18} color="#fff" />
              </View>
            )}

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: "#83829A" }}>promokings • now</Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#111", marginTop: 2 }} numberOfLines={1}>
                {notification.title}
              </Text>
              <Text style={{ fontSize: 14, color: "#83829A", marginTop: 2 }} numberOfLines={3}>
                {notification.body}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
  );
}
