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

const HelpAgentChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const { userData } = useContext(AuthContext); // agent data
  const route = useRoute();

  // Customer ID to chat with
  const customerId = route.params?.userId;
  if (!customerId) {
    return <Text>No customer selected</Text>;
  }

  const sentRef = useMemo(() => ref(db, `messages-query/${customerId}/sent`), [customerId]);
  const receivedRef = useMemo(() => ref(db, `messages-query/${customerId}/received`), [customerId]);

  // Listen for messages (customer sent + agent received)
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
        // Sort descending by createdAt
        const unique = Array.from(new Map(combined.map((m) => [m._id, m])).values());
        return unique.sort((a, b) => b.createdAt - a.createdAt);
      });
    };

    const unsubSent = onValue(sentRef, (snap) => handleDataChange(snap, "sent"));
    const unsubReceived = onValue(receivedRef, (snap) => handleDataChange(snap, "received"));

    return () => {
      unsubSent();
      unsubReceived();
    };
  }, [customerId]);

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
            const isSentByAgent = currentMessage.type === "received"; // agent messages are 'received' here
            return (
              <Bubble
                {...props}
                wrapperStyle={{
                  left: {
                    backgroundColor: isSentByAgent ? COLORS.lightGrey : COLORS.white,
                    marginBottom: 5,
                  },
                  right: {
                    marginBottom: 5,
                  },
                }}
                textStyle={{
                  right: { color: COLORS.white },
                  left: { color: isSentByAgent ? COLORS.black : COLORS.darkGrey },
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
                    onSend([{ text: text.trim(), user: { _id: userData._id } }]);
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

export default HelpAgentChatScreen;
