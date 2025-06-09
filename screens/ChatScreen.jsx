import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
import { Animated, Easing, StyleSheet, View, ImageBackground, TouchableOpacity, Image, Text } from "react-native";
import { GiftedChat, Actions, InputToolbar, Bubble } from "react-native-gifted-chat";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AuthContext } from "../components/auth/AuthContext";
import { db } from "../components/auth/firebase";
import { ref, onValue, set, update } from "firebase/database";
import * as ImagePicker from "expo-image-picker";
import Icon from "../constants/icons";
import { COLORS, SIZES } from "../constants";

import "react-native-get-random-values";
import uuid from "react-native-uuid";

const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userData } = useContext(AuthContext);

  // chatWith is the chosen user (from ChatListScreen)
  const chatWith = route.params?.chatWith;

  // Compute a unique conversation ID by sorting the two user IDs
  const conversationId = useMemo(() => {
    if (!userData?._id || !chatWith?._id) return null;
    return [userData._id, chatWith._id].sort().join("_");
  }, [userData, chatWith]);

  // Reference to the conversation in Firebase
  const conversationRef = useMemo(() => {
    return conversationId ? ref(db, `messages/${conversationId}`) : null;
  }, [conversationId]);

  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [prefilledMessage, setPrefilledMessage] = useState("");
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Listen for real-time updates from Firebase
  useEffect(() => {
    if (!conversationRef) return;

    const unsubscribe = onValue(conversationRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      // Map each key directly to _id
      const loadedMessages = Object.keys(data).map((key) => ({
        _id: key,
        ...data[key],
      }));

      // Sort messages by createdAt timestamp
      const sortedMessages = loadedMessages.sort((a, b) => b.createdAt - a.createdAt);

      setMessages(sortedMessages);
    });

    return () => unsubscribe();
  }, [conversationRef]);

  // Update readBy inside each message node using the message _id (which is your UUID)
  useEffect(() => {
    if (!conversationRef || messages.length === 0) return;

    const updates = {};
    messages.forEach((msg) => {
      if (!msg.readBy || !msg.readBy.includes(userData._id)) {
        updates[`${msg._id}/readBy`] = [...(msg.readBy || []), userData._id];
      }
    });

    if (Object.keys(updates).length > 0) {
      update(ref(db, `messages/${conversationId}`), updates).catch((error) =>
        console.error("Error updating read status:", error)
      );
    }
  }, [messages, conversationRef, userData._id]);

  // Allow users to pick an image
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets.length > 0 && result.assets[0].uri) {
        setSelectedImage(result.assets[0].uri);
        setIsPreviewVisible(true);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  // Send messages to Firebase under the conversation node using your generated UUID
  const handleSend = async (newMessages = []) => {
    if (!conversationRef || newMessages.length === 0) return;
    setIsSending(true);

    // Helper: upload image if one is selected
    const uploadImage = async (imageUri) => {
      try {
        const formData = new FormData();
        formData.append("file", {
          uri: imageUri,
          name: `image_${Date.now()}.jpg`,
          type: "image/jpeg",
        });
        const response = await fetch(`${BACKEND_PORT}/upload`, {
          method: "POST",
          body: formData,
          headers: { "Content-Type": "multipart/form-data" },
        });
        const result = await response.json();
        console.log(result?.fileUrl);
        return result.fileUrl || null;
      } catch (error) {
        console.error("Error uploading image:", error);
        return null;
      }
    };

    for (const message of newMessages) {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      // Generate your own UUID for the message key
      const messageId = uuid.v4();

      try {
        await set(ref(db, `messages/${conversationId}/${messageId}`), {
          text: `${message.text}${prefilledMessage ? `\n\n${prefilledMessage}` : ""}`,
          createdAt: message.createdAt.getTime(),
          user: {
            _id: userData._id,
            name: userData.username,
            avatar: userData.profilePicture || null,
          },
          image: imageUrl,
          readBy: [userData._id],
        });
      } catch (error) {
        console.error("Error saving message to database:", error);
      }
    }
    setIsSending(false);
    setIsPreviewVisible(false);
    setSelectedImage(null);
    setPrefilledMessage("");
  };

  // Memoized bubble renderer for performance
  const MemoizedBubble = React.memo((props) => {
    const { currentMessage } = props;
    const isSent = currentMessage.type === "sent";
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: isSent ? COLORS.lightGrey : COLORS.white,
            marginBottom: 5,
          },
          right: {
            marginBottom: 5,
          },
        }}
        textStyle={{
          right: { color: COLORS.white },
          left: { color: isSent ? COLORS.black : COLORS.darkGrey },
        }}
      />
    );
  });
  MemoizedBubble.displayName = "MemoizedBubble";

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

  return (
    <View style={styles.container}>
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

      {isPreviewVisible && (
        <View style={styles.previewBox}>
          <Text style={{ paddingStart: 2, fontWeight: "600", marginBottom: -10 }}>Picked image</Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedImage(null);
              setIsPreviewVisible(false);
            }}
            style={styles.cancelPreview}
          >
            <Icon name="cancel" size={20} />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        </View>
      )}

      {isSending && (
        <View style={styles.isSending}>
          <Text style={{ textAlign: "center", fontWeight: "600", marginBottom: -10 }}>Saving message...</Text>
        </View>
      )}

      <ImageBackground
        resizeMode="cover"
        source={require("../assets/images/chat-glass.png")}
        style={styles.backgroundImage}
      >
        <GiftedChat
          messages={messages}
          onSend={(newMessages) => handleSend(newMessages)}
          user={{
            _id: userData._id,
            name: userData.username,
            avatar: userData.profilePicture,
          }}
          shouldUpdateMessage={(prevProps, nextProps) => prevProps.currentMessage._id !== nextProps.currentMessage._id}
          renderInputToolbar={(props) => <InputToolbar {...props} containerStyle={styles.inputBox} />}
          renderActions={(props) => (
            <Actions
              {...props}
              containerStyle={styles.actionsContainer}
              onPressActionButton={pickImage}
              icon={() => <Icon name="camerafilled" size={30} />}
            />
          )}
          renderBubble={(props) => <MemoizedBubble {...props} />}
          renderSend={(props) => {
            const { text, onSend } = props;
            return (
              <TouchableOpacity
                style={styles.sendBtn}
                disabled={isSending}
                onPress={() => {
                  if (text.trim().length > 0) {
                    onSend([{ text: text.trim(), user: { _id: userData._id } }], true);
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

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 2,
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
