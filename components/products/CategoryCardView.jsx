import { Text, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import styles from "./categorycardview.style";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Function to generate a unique file name based on the image URL
const generateFileName = (uri) => {
  // Use base64 encoding of the URL for file name safety
  return encodeURIComponent(uri).replace(/%/g, "_") + ".jpg";
};

// Function to cache image
const cacheImage = async (uri) => {
  try {
    const fileName = generateFileName(uri);
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
    return uri; // Fallback to direct URL if caching fails
  }
};

const CategoryCardView = ({ item }) => {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = React.useState(null);

  React.useEffect(() => {
    const loadImage = async () => {
      const cachedUri = await cacheImage(item.imageUrl);
      setImageUri(cachedUri);
    };
    loadImage();
  }, [item.imageUrl]);

  const routeParam = `products/category/${item?.title}`;

  const category = item?.title;

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("ProductList", { routeParam, category });
      }}
    >
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          )}
        </View>
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => {}}>
          <MaterialCommunityIcons name="asterisk" size={24} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default CategoryCardView;
