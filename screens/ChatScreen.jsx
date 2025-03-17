import React, { useState, useEffect, useContext, useMemo } from "react";
import { StyleSheet, View, ImageBackground, TouchableOpacity, Image, Text } from "react-native";
import { GiftedChat, Actions, InputToolbar, Bubble } from "react-native-gifted-chat";
import { useRoute } from "@react-navigation/native";
import { AuthContext } from "../components/auth/AuthContext";
import { db } from "../components/auth/firebase";
import { ref, onValue, push } from "firebase/database";
import * as ImagePicker from "expo-image-picker";
import Icon from "../constants/icons";
import { COLORS, SIZES } from "../constants";
import "react-native-get-random-values";
import uuid from "react-native-uuid";
import { BACKEND_PORT } from "@env";

const ChatScreen = () => {
  const route = useRoute();
  const { userData } = useContext(AuthContext);
  // chatWith is the chosen user (from ChatListScreen)
  const chatWith = route.params?.chatWith;

  // Compute a unique conversation ID by sorting the two user IDs
  const conversationId = useMemo(() => {
    if (!userData?._id || !chatWith?._id) return null;
    return [userData._id, chatWith._id].sort().join("_");
  }, [userData, chatWith]);

  // Reference to the conversation in the Firebase Realtime Database
  const conversationRef = useMemo(() => {
    return conversationId ? ref(db, `messages/${conversationId}`) : null;
  }, [conversationId]);

  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [prefilledMessage, setPrefilledMessage] = useState("");
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Listen for real-time updates from Firebase under the conversation ID
  useEffect(() => {
    if (!conversationRef) return;
    const unsubscribe = onValue(conversationRef, (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = data
        ? Object.keys(data).map((key) => ({
            _id: key,
            ...data[key],
          }))
        : [];
      // Sort messages descending by createdAt timestamp
      const sortedMessages = loadedMessages.sort((a, b) => b.createdAt - a.createdAt);
      setMessages(sortedMessages);
    });
    return () => unsubscribe();
  }, [conversationRef]);

  // Allow users to pick an image (if needed)
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
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        setIsPreviewVisible(true);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  // Send messages to Firebase under the conversation
  const handleSend = async (newMessages = []) => {
    if (!conversationRef || newMessages.length === 0) return;

    setIsSending(true);

    // Helper: upload image if one is selected
    const uploadImage = async (imageUri) => {
      try {
        const formData = new FormData();
        formData.append("profilePicture", {
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
        return result.fileUrl || null;
      } catch (error) {
        console.error("Error uploading image:", error);
        return null;
      }
    };

    for (const message of newMessages) {
      const { text, createdAt, user } = message;
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }
      try {
        await push(conversationRef, {
          _id: uuid.v4(),
          text: `${text}${prefilledMessage ? `\n\n${prefilledMessage}` : ""}`,
          createdAt: createdAt.getTime(),
          user: {
            _id: userData._id,
            name: userData.username,
            avatar: userData.profilePicture || null,
          },
          image: imageUrl,
        });
      } catch (error) {
        console.error("Error pushing message to database:", error);
      }
    }

    setIsSending(false);
    setIsPreviewVisible(false);
    setSelectedImage(null);
    setPrefilledMessage("");
  };

  return (
    <View style={styles.container}>
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
            // You can optionally customize bubble styles based on your logic.
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
          }}
          renderAvatar={(props) => {
            return (
              <View style={styles.avatarContainer}>
                <Image source={require("../assets/icon-home.png")} style={styles.avatarImage} />
              </View>
            );
          }}
          renderSend={(props) => {
            const { text, onSend } = props;
            return (
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={() => {
                  if (text.trim().length > 0) {
                    onSend([{ text: text.trim(), user: { _id: userData._id } }], true);
                  }
                }}
              >
                <Icon name="sendfilled" size={20} color={COLORS.white} />
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
});
