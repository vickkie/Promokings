import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View, ImageBackground, TouchableOpacity, Image, Text } from "react-native";
import { GiftedChat, Actions, InputToolbar, Bubble } from "react-native-gifted-chat";
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
  const { userData } = useContext(AuthContext);
  const [userId, setUserId] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

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
          // Remove old messages of the same type before adding new ones
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
      setIsPreviewVisible(true); // Show the preview box
    }
  };

  const handleSend = async (newMessages = [], type = "sent") => {
    if (newMessages.length === 0) return;

    const userMessagesRef = ref(db, `messages/${userData._id}/${type}`);
    const storage = getStorage();

    const messagePromises = newMessages.map(async (message) => {
      const { text, createdAt, user } = message;

      let imageUrl = null;
      if (selectedImage) {
        try {
          const response = await fetch(selectedImage);
          const blob = await response.blob();
          const imageRef = storageRef(storage, `images/${selectedImage.split("/").pop()}`);
          await uploadBytes(imageRef, blob);
          imageUrl = await getDownloadURL(imageRef);
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }

      try {
        await push(userMessagesRef, {
          _id: uuid.v4(),
          text,
          createdAt: createdAt.getTime(),
          user,
          image: imageUrl,
        });
      } catch (error) {
        console.error("Error pushing message to database:", error);
      }

      setSelectedImage(null);
      setIsPreviewVisible(false);
    });

    await Promise.all(messagePromises);
  };

  return (
    <View style={styles.container}>
      {isPreviewVisible && (
        <View style={styles.previewBox}>
          <Text style={{ textAlign: "center", fontWeight: "600", marginBottom: -10 }}>Picked image</Text>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
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
          icon={() => <Icon name="camerafilled" size={29} />}
          onPressActionButton={pickImage}
          renderAvatar={(props) => {
            return (
              <View style={styles.avatarContainer}>
                <Image source={require("../assets/icon-home.png")} style={styles.avatarImage} />
              </View>
            );
          }}
          renderUsername={(props) => {
            const { currentMessage } = props;
            const username = currentMessage.user ? currentMessage.user.name : "default";
            return <Text style={styles.usernameText}>{username}</Text>;
          }}
          renderLoading={(props) => {
            return <Text style={styles.usernameText}>Loading...</Text>;
          }}
          renderActions={(props) => (
            <Actions
              {...props}
              containerStyle={styles.actionsContainer}
              onPressActionButton={pickImage}
              icon={() => <Icon name="camerafilled" size={30} />}
            />
          )}
          timeTextStyle={{ right: { color: COLORS.lightWhite } }}
          bottomOffset={40}
          renderSend={(props) => {
            const { text, user, onSend } = props;
            return (
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={() => {
                  if (text && onSend) {
                    onSend(
                      {
                        text: text.trim(),
                        user,
                        _id: userId,
                      },
                      true
                    );
                  }
                }}
              >
                <Icon name="sendfilled" size={20} color={COLORS.white} />
              </TouchableOpacity>
            );
          }}
          renderInputToolbar={(props) => <InputToolbar {...props} containerStyle={styles.inputBox} />}
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
  bottomSpacer: {
    paddingBottom: 20,
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
  usernameText: {
    fontSize: SIZES.small,
    fontWeight: "bold",
    color: "#333",
  },
  previewBox: {
    position: "absolute",
    top: 20,
    left: 10,
    height: 170,
    width: 150,
    backgroundColor: COLORS.themey,
    borderRadius: 10,
    overflow: "hidden",
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
});
