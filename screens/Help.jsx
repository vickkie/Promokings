import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View, Button } from "react-native";
import { GiftedChat, Actions } from "react-native-gifted-chat";
import { AuthContext } from "../components/auth/AuthContext";
import { db } from "../components/auth/firebase";
import { ref, onValue, push } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import Icon from "../constants/icons";
import { COLORS } from "../constants";

const Help = () => {
  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const { userData } = useContext(AuthContext);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (userData && userData._id) {
      setUserId(userData._id);

      // Fetch messages specific to the user
      const userMessagesRef = ref(db, `messages/${userData._id}`);
      onValue(userMessagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const parsedMessages = Object.keys(data)
            .map((key) => ({
              _id: key,
              ...data[key],
            }))
            .sort((a, b) => b.createdAt - a.createdAt);
          setMessages(parsedMessages);
        } else {
          setMessages([]); // Set messages to empty if no data found
        }
      });
    }
  }, [userData]);

  const pickImage = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    // Pick an image from the library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.uri);
    }
  };

  const handleSend = async (newMessages = []) => {
    const messagePromises = newMessages.map(async (message) => {
      const { text, createdAt, user } = message;
      const userMessagesRef = ref(db, `messages/${userData._id}`);

      let imageUrl = null;
      if (selectedImage) {
        const storage = getStorage();
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const imageRef = storageRef(storage, `images/${selectedImage.split("/").pop()}`);
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }

      return push(userMessagesRef, {
        text,
        createdAt: createdAt.getTime(),
        user,
        image: imageUrl,
      });
    });

    // Wait for all message promises to complete
    await Promise.all(messagePromises);

    // Assuming successful send, optimistic UI update is handled by GiftedChat
    setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
    setSelectedImage(null); // Reset the selected image
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an Image" onPress={pickImage} />
      <GiftedChat
        messages={messages}
        onSend={handleSend}
        user={{
          _id: userId,
        }}
        icon={() => {
          <Icon name="camerafilled" size={24} color={COLORS.black} />;
        }}
        onPressActionButton={pickImage}
        renderAvatar={null}
        renderActions={(props) => {
          <Actions {...props} containerStyle={styles.bottomsend} />;
        }}
      />
    </View>
  );
};

export default Help;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 2,
  },
  bottomsend: {
    position: "absolute",
    bottom: 5,
    right: 50,
    zIndex: 999900,
  },
  icon: {},
});
