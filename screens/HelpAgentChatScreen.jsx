import React, { useRef, useState, useEffect, useContext, useMemo } from "react";
import { StyleSheet, View, ImageBackground, TouchableOpacity, Image, Text } from "react-native";
import { Animated, Easing } from "react-native";
import { GiftedChat, Actions, InputToolbar, Bubble } from "react-native-gifted-chat";
import { useRoute, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../components/auth/AuthContext";
import { db } from "../components/auth/firebase";
import { ref, onValue, push, update } from "firebase/database";
import * as ImagePicker from "expo-image-picker";
import Icon from "../constants/icons";
import { COLORS, SIZES } from "../constants";
import "react-native-get-random-values";
import uuid from "react-native-uuid";
import { BACKEND_PORT } from "@env";

const HelpAgentChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const { userData } = useContext(AuthContext);
  const route = useRoute();
  const navigation = useNavigation();

  const customerId = route.params?.chatWith?._id;
  const chatWith = route.params?.chatWith;

  if (!customerId) {
    return <Text>No customer selected</Text>;
  }

  const sentRef = useMemo(() => ref(db, `messages-query/${customerId}/sent`), [customerId]);
  const receivedRef = useMemo(() => ref(db, `messages-query/${customerId}/received`), [customerId]);

  useEffect(() => {
    const handleDataChange = (snapshot, type) => {
      const data = snapshot.val();
      const newMessages = data
        ? Object.keys(data).map((key) => ({
            _id: key,
            ...data[key],
            type, // "sent" or "received"
          }))
        : [];

      setMessages((prevMessages) => {
        const filtered = prevMessages.filter((msg) => msg.type !== type);
        const combined = [...filtered, ...newMessages];
        const unique = Array.from(new Map(combined.map((m) => [m._id, m])).values());
        return unique.sort((a, b) => b.createdAt - a.createdAt);
      });

      // Mark "sent" messages as read
      if (type === "sent") {
        markSentMessagesAsRead().catch(console.error);
      }
    };

    const unsubSent = onValue(sentRef, (snap) => handleDataChange(snap, "sent"));
    const unsubReceived = onValue(receivedRef, (snap) => handleDataChange(snap, "received"));

    return () => {
      unsubSent();
      unsubReceived();
    };
  }, [customerId]);

  const markSentMessagesAsRead = async () => {
    const snapshot = await new Promise((resolve) => {
      onValue(
        sentRef,
        (snap) => {
          resolve(snap);
        },
        { onlyOnce: true }
      );
    });

    const data = snapshot.val();
    if (!data) return;

    const updates = {};
    Object.entries(data).forEach(([key, message]) => {
      if (message.read === false) {
        updates[`${key}/read`] = true;
      }
    });

    if (Object.keys(updates).length > 0) {
      await update(sentRef, updates);
    }
  };

  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isSending) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.stopAnimation();
    }
  }, [isSending]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Need camera roll permissions!");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets.length > 0 && result.assets[0].uri) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (e) {
      console.error("Image picker error:", e);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: `image_${Date.now()}.jpg`,
        type: "image/jpeg",
      });
      const res = await fetch(`${BACKEND_PORT}/upload`, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const json = await res.json();
      return json.fileUrl || null;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  const handleSend = async (newMessages = []) => {
    if (newMessages.length === 0) return;
    setIsSending(true);

    for (const msg of newMessages) {
      const { text, createdAt } = msg;
      let imageUrl = null;

      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      try {
        await push(receivedRef, {
          _id: uuid.v4(),
          text,
          createdAt: createdAt.getTime(),
          read: false,
          user: {
            _id: userData._id,
            name: userData.username,
            avatar: userData.profilePicture || null,
          },
          image: imageUrl || null,
        });
      } catch (e) {
        console.error("Error sending message:", e);
      }
    }

    setSelectedImage(null);
    setIsSending(false);
  };

  return (
    <View style={styles.container}>
      {selectedImage && (
        <View style={styles.previewBox}>
          <Text style={{ fontWeight: "600", marginBottom: -10 }}>Picked image</Text>
          <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.cancelPreview}>
            <Icon name="cancel" size={20} />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        </View>
      )}

      {isSending && (
        <View style={styles.isSending}>
          <Text style={{ textAlign: "center", fontWeight: "600", marginBottom: -10 }}>Sending message...</Text>
        </View>
      )}

      <View style={styles.wrapper}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
          <Icon name="backbutton" size={26} />
        </TouchableOpacity>
        <View style={styles.upperRow}>
          <View style={styles.upperButtons}>
            <Text style={styles.heading}>{chatWith?.username || "Chat"}</Text>
          </View>
          <TouchableOpacity onPress={() => {}} style={styles.buttonWrap2}>
            {chatWith?.profilePicture ? (
              <Image source={{ uri: chatWith.profilePicture }} style={styles.profilePicture} />
            ) : (
              <Image source={require("../assets/images/userDefault.webp")} style={styles.profilePicture} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ImageBackground
        resizeMode="cover"
        source={require("../assets/images/chat-glass.png")}
        style={styles.backgroundImage}
      >
        <GiftedChat
          messages={messages}
          onSend={handleSend}
          user={{
            _id: userData._id,
            name: userData.username,
            avatar: userData.profilePicture,
          }}
          renderInputToolbar={(props) => <InputToolbar {...props} containerStyle={styles.inputBox} />}
          renderActions={(props) => (
            <Actions
              {...props}
              containerStyle={styles.actionsContainer}
              onPressActionButton={pickImage}
              icon={() => <Icon name="camerafilled" size={30} />}
            />
          )}
          renderBubble={(props) => {
            const { currentMessage } = props;
            const isReceived = currentMessage.type === "sent"; // customer messages on left
            return (
              <Bubble
                {...props}
                wrapperStyle={{
                  left: {
                    backgroundColor: COLORS.white,
                    marginBottom: 5,
                  },
                  right: {
                    // backgroundColor: "skyblue",
                    marginBottom: 5,
                  },
                }}
                textStyle={{
                  left: { color: COLORS.darkGrey },
                  right: { color: COLORS.white },
                }}
              />
            );
          }}
          renderAvatar={(props) => {
            const { currentMessage } = props;
            if (currentMessage?.user?.avatar) {
              return (
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: currentMessage.user.avatar }} style={styles.avatarImage} />
                </View>
              );
            }
            return <View style={styles.avatarContainer} />;
          }}
          renderSend={(props) => {
            const { text, onSend } = props;
            return (
              <TouchableOpacity
                style={styles.sendBtn}
                disabled={isSending}
                onPress={() => {
                  if (text.trim().length > 0) {
                    onSend({ text: text.trim() }, true);
                  }
                }}
              >
                {!isSending ? (
                  <Icon name="sendfilled" size={20} color={COLORS.white} />
                ) : (
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Icon name="loadingcircle" size={20} color={COLORS.white} />
                  </Animated.View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </ImageBackground>
    </View>
  );
};

export default HelpAgentChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 3,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  actionsContainer: {
    position: "absolute",
    right: 50,
    bottom: 5,
    zIndex: 9999,
  },
  sendBtn: {
    height: 40,
    width: 40,
    borderRadius: 40,
    backgroundColor: COLORS.themey,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  inputBox: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 18,
    borderRadius: 20,
    paddingTop: 5,
    bottom: 5,
  },
  previewBox: {
    position: "absolute",
    top: 20,
    left: 10,
    height: 170,
    width: 150,
    backgroundColor: COLORS.themey,
    borderRadius: 10,
    zIndex: 10,
    borderStyle: "solid",
    borderColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "96%",
    height: "96%",
    resizeMode: "contain",
  },
  isSending: {
    position: "absolute",
    top: 20,
    left: 10,
    height: 20,
    width: SIZES.width,
    backgroundColor: COLORS.themew,
    overflow: "hidden",
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarContainer: {
    borderRadius: 100,
    marginBottom: 10,
  },
  cancelPreview: {
    position: "absolute",
    left: 1,
    bottom: -33,
    backgroundColor: "white",
    height: 30,
    width: 30,
    borderRadius: 100,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  wrapper: {
    flexDirection: "column",
    position: "absolute",
    top: 2,
  },
  backBtn: {
    left: 10,
  },
  buttonView: {
    backgroundColor: COLORS.themew,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
    transform: [{ rotate: "180deg" }],
  },
  buttonWrap: {
    backgroundColor: COLORS.themeg,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    zIndex: 9,
    top: 10,
    left: 10,
  },
  upperRow: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    zIndex: 2,
    minHeight: 60,
  },
  upperButtons: {
    width: SIZES.width - 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SIZES.medium,
  },
  topprofileheading: {
    fontSize: SIZES.medium,
    textAlign: "center",
    color: COLORS.themeb,
    fontFamily: "semibold",
  },
  outWrap: {
    backgroundColor: COLORS.themeg,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 5,
    right: 10,
  },
  lowerheader: {
    flexDirection: "column",
    justifyContent: "flex-start",
    width: SIZES.width - 20,
    marginTop: 5,
    paddingTop: SIZES.xSmall,
    paddingBottom: 20,
  },
  heading: {
    fontFamily: "bold",
    textTransform: "capitalize",
    fontSize: SIZES.xLarge + 3,
    textAlign: "left",
    color: COLORS.themeb,
    marginStart: 20,
  },
  statement: {
    fontFamily: "regular",
    paddingLeft: 20,
    paddingVertical: 5,
    color: COLORS.gray2,
    textAlign: "center",
  },
  buttonWrap2: {
    backgroundColor: COLORS.hyperlight,
    borderRadius: 100,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 13,
    top: 5,
  },
  profilePicture: {
    height: 52,
    width: 52,
    borderRadius: 100,
  },
});
