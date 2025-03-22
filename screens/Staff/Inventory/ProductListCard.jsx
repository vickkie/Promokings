import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React, { useState, useEffect, useContext, useRef } from "react";
import { COLORS, SIZES } from "../../../constants";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import usePost from "../../../hook/usePost";
import { AuthContext } from "../../../components/auth/AuthContext";
import Toast from "react-native-toast-message";
import * as FileSystem from "expo-file-system";
import Icon from "../../../constants/icons";
import InventoryAdd from "../../../components/bottomsheets/InventoryAdd";

// Function to cache image
const cacheImage = async (uri) => {
  try {
    // Create a safe filename
    const fileName = encodeURIComponent(uri.replace(/[^a-zA-Z0-9]/g, "_"));
    const fileUri = FileSystem.documentDirectory + fileName;
    const { exists } = await FileSystem.getInfoAsync(fileUri);
    if (!exists) {
      // console.log(`Downloading image to ${fileUri}`);
      await FileSystem.downloadAsync(uri, fileUri);
    } else {
      // console.log(`Image already cached at ${fileUri}`);
    }
    return fileUri;
  } catch (error) {
    // console.error(`Failed to cache image from ${uri}`, error);
    return uri; // Fallback to the original URL if caching fails
  }
};

const ProductListCard = ({ item, isGridView }) => {
  const navigation = useNavigation();
  const [isWished, setIsWished] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [imageUri, setImageUri] = useState(null);

  const {
    updateStatus,
    isLoading: isLoadingFavourites,
    error: favouritesError,
    errorMessage,
    addCart: addFavourite,
  } = usePost("favourites");

  const { userData, userLogin } = useContext(AuthContext);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1); // Default user ID for demonstration purposes && test
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  useEffect(() => {
    const loadImage = async () => {
      if (item.imageUrl) {
        const cachedUri = await cacheImage(item.imageUrl);
        setImageUri(cachedUri);
      }
    };
    loadImage();
  }, [item.imageUrl]);

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2 ? text2 : "",
    });
  };

  const transitionTag = item._id ? `${item._id}` : null;

  const BottomSheetRef = useRef(null);

  const openMenu = () => {
    if (BottomSheetRef.current) {
      BottomSheetRef.current.present();
    }
  };

  return (
    <>
      <InventoryAdd ref={BottomSheetRef} item={item} />
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("PreviewProduct", {
            item: item,
            itemid: item._id,
          });
        }}
      >
        <View style={!isGridView ? styles.container : styles.gridCard}>
          <View style={isGridView ? styles.imageContainer : styles.imageList}>
            <Image
              source={{ uri: imageUri || item.imageUrl }}
              style={styles.image}
              sharedTransitionTag={transitionTag}
            />
          </View>
          <View style={styles.details}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.supplier} numberOfLines={1}>
              {`${item.quantity} units`}
            </Text>
            <Text style={isGridView ? styles.gridPrice : styles.price}>
              Kshs {parseInt(item.price.replace("$", ""))}
            </Text>
          </View>

          <TouchableOpacity
            style={isGridView ? styles.addBtn : styles.editPencil}
            // onPress={() => {
            //   navigation.navigate("EditProduct", {
            //     item: item,
            //     itemid: item._id,
            //   });
            // }}

            onPress={openMenu}
          >
            <Icon name="pencil" size={27} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </>
  );
};

export default ProductListCard;

const styles = StyleSheet.create({
  container: {
    marginEnd: 10,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themeg,
    display: "flex",
    flexDirection: "row",
  },

  gridCard: {
    marginEnd: 10,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themeg,
    width: 162,
    height: 230,
  },

  imageContainer: {
    flex: 1,
    width: 157,
    marginTop: SIZES.small / 2 - 4,
    marginLeft: SIZES.small / 2 - 4,
    overflow: "hidden",
    borderRadius: SIZES.small,
    backgroundColor: COLORS.themew,
  },

  imageList: {
    height: 70,
    width: 70,
    marginLeft: SIZES.small / 2,
    overflow: "hidden",
    borderRadius: SIZES.small,
    backgroundColor: COLORS.themeg,
    alignSelf: "center",
  },
  image: {
    aspectRatio: 1,
    resizeMode: "cover",
  },
  details: {
    padding: SIZES.small,
  },
  title: {
    fontFamily: "bold",
    fontSize: SIZES.medium,
    marginBottom: 2,
  },
  price: {
    fontFamily: "medium",
  },

  gridPrice: {
    paddingTop: 10,
  },
  supplier: {
    fontSize: SIZES.medium,
    paddingVertical: SIZES.small - 7,
  },
  addBtn: {
    position: "absolute",
    bottom: SIZES.small,
    right: SIZES.small,
  },
  editPencil: {
    position: "absolute",
    right: SIZES.small,
    alignSelf: "center",
  },
});
