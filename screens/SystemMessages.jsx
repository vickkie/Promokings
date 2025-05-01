import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet, ActivityIndicator, ImageBackground, Text, Image } from "react-native";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import { COLORS, SIZES } from "../constants";
import { AuthContext } from "../components/auth/AuthContext";
import useFetch from "../hook/useFetch";
import LottieView from "lottie-react-native";
import { RefreshControl } from "react-native-gesture-handler";

const SystemMessages = () => {
  const [messages, setMessages] = useState([]);
  const { userData, userLogin } = useContext(AuthContext);
  const [userId, setUserId] = useState(null);

  // console.log(userId);

  useEffect(() => {
    if (userData && userData._id) {
      setUserId(userData._id);
    } else {
      setUserId(1); // Handle case where userData is not available
    }
  }, [userLogin, userData]);

  const {
    data: userNotifications,
    isLoading: isLoadingUser,
    refetch: refetchUser,
  } = useFetch(`notification/user/${userData?._id}`);
  const {
    data: systemNotifications,
    isLoading: isLoadingSystem,
    refetch: refetchSystem,
  } = useFetch(`notification/user/all`);

  useEffect(() => {
    if (!isLoadingUser && !isLoadingSystem && (userNotifications || systemNotifications)) {
      const combinedNotifications = [...(userNotifications || []), ...(systemNotifications || [])];

      const formattedMessages = combinedNotifications.map((notification, index) => {
        const messageText = notification.metadata.header
          ? `${notification.metadata.header}\n${notification.message}`
          : notification.message;
        const messageLink = notification.metadata.link ? `\n\n(${notification.metadata.link})` : "";
        const finalText = `${messageText}${messageLink}`;

        return {
          _id: notification._id || index + 1,
          text: finalText,
          createdAt: new Date(notification.createdAt),
          user: {
            _id: notification.userId ? 1 : 2,
            name: notification.userId ? "User" : "System",
          },
          type: notification.type || "info",
          metadata: notification.metadata, // Include metadata in the message object
        };
      });

      // Sort messages by createdAt
      formattedMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setMessages(formattedMessages);
    }
  }, [isLoadingUser, isLoadingSystem, userNotifications, systemNotifications]);

  const renderCustomBubble = (props) => {
    const { currentMessage } = props;
    const { metadata } = currentMessage;

    const backgroundColor =
      currentMessage.type === "info"
        ? COLORS.info
        : currentMessage.type === "warning"
        ? COLORS.warning
        : currentMessage.type === "error"
        ? COLORS.tertiary
        : currentMessage.type === "success"
        ? COLORS.success
        : COLORS.themeg;

    return (
      <View>
        <Bubble
          {...props}
          wrapperStyle={{
            right: {
              backgroundColor,
              marginBottom: 5,
              padding: 10,
              borderRadius: SIZES.medium,
              minWidth: SIZES.width - 20,
              marginStart: -40,
              borderTopLeftRadius: 0,
            },
          }}
          textStyle={{
            left: {
              color: COLORS.darkGrey,
            },
          }}
        />
      </View>
    );
  };

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>These are system-generated messages.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        resizeMode="cover"
        source={require("../assets/images/chat-glass.png")}
        style={styles.backgroundImage}
      >
        {messages && (
          <Image
            source={require("../assets/icon-home.png")} // Path to your static avatar image
            style={styles.avatar}
          />
        )}

        <GiftedChat
          messages={messages}
          user={{
            _id: 1,
          }}
          renderBubble={renderCustomBubble}
          renderInputToolbar={() => null}
          isTyping={isLoadingSystem || isLoadingSystem}
          alignTop={true}
          renderAvatarOnTop={true}
          renderChatFooter={renderFooter}
        />
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 55,
    alignSelf: "center",
    marginTop: 10,
  },
  footer: {
    padding: 10,
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    // marginBottom: 10,
    textAlign: "center",
    width: SIZES.width,
  },
  footerText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  containLottie: {
    justifyContent: "center",
    alignItems: "center",
    width: SIZES.width - 20,
    flex: 1,
  },
  animationWrapper: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  actionsContainer: {
    position: "absolute",
    right: 50,
    top: 5,
    zIndex: 9999,
  },
  inputBox: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 2,
    borderRadius: 20,
    paddingTop: 5,
    top: 5,
  },
});

export default SystemMessages;
