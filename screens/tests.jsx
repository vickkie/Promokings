import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View, ImageBackground, TouchableOpacity, Image } from "react-native";
import { GiftedChat, Actions, InputToolbar, Bubble } from "react-native-gifted-chat";
import { AuthContext } from "../components/auth/AuthContext";
import { db } from "../components/auth/firebase";
import { ref, onValue, push } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import Icon from "../constants/icons";
import { COLORS } from "../constants";
import uuid from "react-native-uuid";


const Help = () => {
  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const { userData } = useContext(AuthContext);


  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (userData && userData._id) {
      setUserId(userData._id);

      const sentRef = ref(db, `messages/${userData._id}/sent`);
      const replyRef = ref(db, `messages/${userData._id}/reply`);

      const handleNewData = (data, type) => {
        if (!data) return [];
        return Object.keys(data).map((key) => ({
          _id: key,
          ...data[key],
          type,
        }));
      };

      const unsubscribeSent = onValue(sentRef, (snapshot) => {
        const sentMessages = handleNewData(snapshot.val(), "sent");
        setMessages((prevMessages) => {
          const allMessages = [...prevMessages, ...sentMessages];
          const uniqueMessages = Array.from(new Map(allMessages.map((item) => [item._id, item])).values());
          return uniqueMessages.sort((a, b) => b.createdAt - a.createdAt);
        });
      });

      const unsubscribeReply = onValue(replyRef, (snapshot) => {
        const replyMessages = handleNewData(snapshot.val(), "reply");
        setMessages((prevMessages) => {
          const allMessages = [...prevMessages, ...replyMessages];
          const uniqueMessages = Array.from(new Map(allMessages.map((item) => [item._id, item])).values());
          return uniqueMessages.sort((a, b) => b.createdAt - a.createdAt);
        });
      });

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
          _id: uuid.v4(), // Use UUID for unique message ID
          text,
          createdAt: createdAt.getTime(),
          user,
          image: imageUrl,
        });
      } catch (error) {
        console.error("Error pushing message to database:", error);
      }

      setSelectedImage(null);
    });

    await Promise.all(messagePromises);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        resizeMode="cover"
        source={require("../assets/images/chatbg.png")}
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
            const { currentMessage } = props;
            const avatarUri = currentMessage.user && currentMessage.user.avatar;
            return (
              // <View style={styles.avatarContainer}>
              //   <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              // </View>
              <TouchableOpacity style={{ marginBottom: 10 }}>
                <Icon name="user" size={29} />
              </TouchableOpacity>
            );
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
});

// import React, { useState, useEffect, useContext } from "react";
// import { StyleSheet, View, ImageBackground, TouchableOpacity } from "react-native";
// import { GiftedChat, Actions, InputToolbar, Bubble } from "react-native-gifted-chat";
// import { AuthContext } from "../components/auth/AuthContext";
// import { db } from "../components/auth/firebase";
// import { ref, onValue, push } from "firebase/database";
// import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
// import * as ImagePicker from "expo-image-picker";
// import Icon from "../constants/icons";
// import { COLORS } from "../constants";

// const Help = () => {
//   const [messages, setMessages] = useState([]);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const { userData } = useContext(AuthContext);
//   const [userId, setUserId] = useState(null);

//   useEffect(() => {
//     if (userData && userData._id) {
//       setUserId(userData._id);

//       // Fetch messages specific to the user
//       const userMessagesRef = ref(db, `messages/${userData._id}/sent`);
//       const handleValueChange = (snapshot) => {
//         const data = snapshot.val();
//         if (data) {
//           const parsedMessages = Object.keys(data)
//             .map((key) => ({
//               _id: key,
//               ...data[key],
//             }))
//             .sort((a, b) => b.createdAt - a.createdAt); // sorting latest first
//           setMessages(parsedMessages);
//         } else {
//           setMessages([]); // Sets messages to empty if no data found
//         }
//       };

//       const unsubscribe = onValue(userMessagesRef, handleValueChange, {
//         onlyOnce: false, // Ensures it keeps listening for changes
//       });

//       // Clean up listener on unmount
//       return () => unsubscribe();
//     }
//   }, [userData]);

//   const pickImage = async () => {
//     // Request permission to access media library
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") {
//       alert("Sorry, we need camera roll permissions to make this work!");
//       return;
//     }

//     // Pick an image from the library
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setSelectedImage(result.uri);
//     }
//   };

//   const handleSend = async (newMessages = []) => {
//     if (newMessages.length === 0) return;

//     console.log("Sending messages:", newMessages);

//     const messagePromises = newMessages.map(async (message) => {
//       const { text, createdAt, user } = message;
//       const userMessagesRef = ref(db, `messages/${userData._id}/sent`);

//       let imageUrl = null;
//       if (selectedImage) {
//         try {
//           const storage = getStorage();
//           const response = await fetch(selectedImage);
//           const blob = await response.blob();
//           const imageRef = storageRef(storage, `images/${selectedImage.split("/").pop()}`);
//           await uploadBytes(imageRef, blob);
//           imageUrl = await getDownloadURL(imageRef);
//         } catch (error) {
//           console.error("Error uploading image:", error);
//         }
//       }

//       try {
//         await push(userMessagesRef, {
//           text,
//           createdAt: createdAt.getTime(),
//           user,
//           image: imageUrl,
//         });
//         // console.log("Message pushed to database");
//       } catch (error) {
//         // console.error("Error pushing message to database:", error);
//       }

//       // Clear selected image after sending
//       setSelectedImage(null);
//     });

//     // Wait for all message promises to complete
//     await Promise.all(messagePromises);

//     // Refresh messages list
//     //! Remove this block, it is not needed. GiftedChat handles the message update automatically.
//     // setMessages((prevMessages) => {
//     //   const newMessagesWithExisting = [...prevMessages, ...newMessages];
//     //   return GiftedChat.append(newMessagesWithExisting, newMessages);
//     // });
//   };

//   return (
//     <View style={styles.container}>
//       <ImageBackground
//         resizeMode="cover"
//         source={require("../assets/images/chatbg.png")}
//         style={styles.backgroundImage}
//       >
//         <GiftedChat
//           messages={messages}
//           onSend={handleSend}
//           user={{
//             _id: userId,
//             name: userData.username,
//             avatar: userData.profilePicture,
//           }}
//           icon={() => <Icon name="camerafilled" size={29} />}
//           onPressActionButton={pickImage}
//           renderAvatar={(props) => (
//             <View style={styles.avatarContainer}>
//               <Icon name="user" size={23} color={COLORS.black} />

//               {/* <Image source={{ uri: props.currentMessage.user.avatar }} style={styles.avatarImage} /> */}
//             </View>
//           )}
//           renderActions={(props) => (
//             <Actions
//               {...props}
//               containerStyle={styles.actionsContainer}
//               onPressActionButton={pickImage}
//               icon={() => <Icon name="camerafilled" size={30} />}
//             />
//           )}
//           timeTextStyle={{ right: { color: COLORS.lightWhite } }}
//           bottomOffset={40}
//           renderSend={(props) => {
//             const { text, user, onSend } = props;
//             return (
//               <TouchableOpacity
//                 style={styles.sendBtn}
//                 onPress={() => {
//                   if (text && onSend) {
//                     onSend(
//                       {
//                         text: text.trim(),
//                         user,
//                         _id: userId,
//                       },
//                       true
//                     );
//                   }
//                 }}
//               >
//                 <Icon name="sendfilled" size={20} color={COLORS.white} />
//               </TouchableOpacity>
//             );
//           }}
//           renderInputToolbar={(props) => <InputToolbar {...props} containerStyle={styles.inputBox} />}
//           renderBubble={(props) => (
//             <Bubble
//               {...props}
//               textStyle={{ right: { color: COLORS.white } }}
//               wrapperStyle={{
//                 left: {
//                   backgroundColor: COLORS.white,
//                 },
//                 right: {
//                   marginBottom: 5,
//                 },
//               }}
//             />
//           )}
//         />
//       </ImageBackground>
//     </View>
//   );
// };

// export default Help;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   backgroundImage: {
//     flex: 1,
//     width: "100%",
//     height: "100%",
//   },
//   actionsContainer: {
//     position: "absolute",
//     right: 50,
//     bottom: 5,
//     zIndex: 9999,
//   },
//   sendBtn: {
//     height: 40,
//     width: 40,
//     borderRadius: 40,
//     backgroundColor: COLORS.themey,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 5,
//   },
//   inputBox: {
//     marginLeft: 10,
//     marginRight: 10,
//     marginBottom: 2,
//     borderRadius: 20,
//     paddingTop: 5,
//     bottom: 5,
//   },
//   bottomSpacer: {
//     paddingBottom: 20,
//   },
//   avatarImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//   },
// });
