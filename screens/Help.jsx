import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View, ImageBackground, TouchableOpacity, Image, Text } from "react-native";
import { GiftedChat, Actions, InputToolbar, Bubble } from "react-native-gifted-chat";
import { useRoute } from "@react-navigation/native";
import { AuthContext } from "../components/auth/AuthContext";
import { db } from "../components/auth/firebase";
import { ref, onValue, push } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import Icon from "../constants/icons";
import { COLORS, SIZES } from "../constants";
import uuid from "react-native-uuid";

const Help = () => {
  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [prefilledMessage, setPrefilledMessage] = useState("");
  const { userData } = useContext(AuthContext);
  const [userId, setUserId] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [imageFromRoute, setImageFromRoute] = useState(false);
  const [itemId, setItemId] = useState(null);
  const [itemName, setItemName] = useState("");
  const [itemImage, setItemImage] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const route = useRoute();

  useEffect(() => {
    if (userData && userData._id) {
      setUserId(userData._id);
      const sentRef = ref(db, `messages/${userData._id}/sent`);
      const replyRef = ref(db, `messages/${userData._id}/reply`);

      const handleDataChange = (snapshot, type) => {
        const data = snapshot.val();
        const newMessages = data
          ? Object.keys(data).map((key) => ({
              _id: key,
              ...data[key],
              type,
            }))
          : [];

        setMessages((prevMessages) => {
          const filteredMessages = prevMessages.filter((msg) => msg.type !== type);
          const allMessages = [...filteredMessages, ...newMessages];
          const uniqueMessages = Array.from(new Map(allMessages.map((item) => [item._id, item])).values());
          return uniqueMessages.sort((a, b) => b.createdAt - a.createdAt);
        });
      };

      const unsubscribeSent = onValue(sentRef, (snapshot) => handleDataChange(snapshot, "sent"));
      const unsubscribeReply = onValue(replyRef, (snapshot) => handleDataChange(snapshot, "reply"));

      return () => {
        unsubscribeSent();
        unsubscribeReply();
      };
    }
  }, [userData]);

  useEffect(() => {
    if (route.params) {
      const { item_id, item_name, item_image } = route.params;
      setItemId(item_id);
      setItemName(item_name);
      setItemImage(item_image);
      setSelectedImage(item_image);
      setPrefilledMessage(`Inquiring about item:\n${item_name}\n(Ref: ${item_id})`);
      setIsPreviewVisible(true);
      setImageFromRoute(true);
    }
  }, [route.params]);

  const pickImage = async () => {
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

    if (!result.canceled) {
      setSelectedImage(result.uri);
      setIsPreviewVisible(true);
      setImageFromRoute(false);
    }
  };

  const handleSend = async (newMessages = [], type = "sent") => {
    if (newMessages.length === 0) return;

    const userMessagesRef = ref(db, `messages/${userData._id}/${type}`);

    const messagePromises = newMessages.map(async (message) => {
      const { text, createdAt, user } = message;
      let imageUrl = null;

      if (selectedImage && !imageFromRoute) {
        try {
          setIsSending(true);
          const storage = getStorage();
          const imageRef = storageRef(storage, `images/${uuid.v4()}`);
          const response = await fetch(selectedImage);
          const blob = await response.blob();
          await uploadBytes(imageRef, blob);
          imageUrl = await getDownloadURL(imageRef);
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }

      try {
        await push(userMessagesRef, {
          _id: uuid.v4(),
          text: `${text}${prefilledMessage ? `\n\n${prefilledMessage}` : ""}`,
          createdAt: createdAt.getTime(),
          user,
          image: itemImage || imageUrl,
        });

        setIsSending(false);
      } catch (error) {
        console.error("Error pushing message to database:", error);
      }

      // Invalidate the state variables after sending

      setIsPreviewVisible(false);
      setSelectedImage(null);
      setPrefilledMessage("");
      setItemId(null);
      setItemName("");
      setItemImage(null);
    });

    await Promise.all(messagePromises);
  };

  return (
    <View style={styles.container}>
      {console.log(isPreviewVisible)}
      {isPreviewVisible && (
        <View style={styles.previewBox} key={isPreviewVisible ? "visible" : "hidden"}>
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

      {isSending === true && (
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
          onSend={(newMessages) => handleSend(newMessages, "sent")}
          user={{
            _id: userId,
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
                    onSend([{ text: text.trim(), user: { _id: userId } }], true);
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

export default Help;

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
