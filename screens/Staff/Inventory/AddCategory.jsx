import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import Toast from "react-native-toast-message";
import { COLORS, SIZES } from "../../../constants";
import { ScrollView } from "react-native-gesture-handler";
import useFetch from "../../../hook/useFetch";
import { BACKEND_PORT } from "@env";
import Icon from "../../../constants/icons";

const AddCategory = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("https://i.postimg.cc/j56q20rB/images.jpg");
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { data: categories, isLoading: isCategoriesLoading, error: categoriesError } = useFetch("category");

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      setTitle("");
      setImageUrl("https://i.postimg.cc/j56q20rB/images.jpg");
      setImage(null);
      setDescription("");
    } catch (error) {
      console.log("refresh failed");
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 2000);
    }
  }, []);

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Category title is required"),
    description: Yup.string().required("Description is required"),
  });

  const handleAddCategory = async () => {
    const newCategory = {
      title,
      imageUrl,
      description,
    };

    try {
      if (image) {
        const uploadedImageUrl = await uploadImage(image);
        setImageUrl(uploadedImageUrl);
        newCategory.imageUrl = uploadedImageUrl;
      }
      await validationSchema.validate(newCategory);
      const response = await axios.post(`${BACKEND_PORT}/api/category`, newCategory);

      if (response.status === 201) {
        showToast("success", "Category added successfully!");
        setTitle("");
        setImageUrl("https://i.postimg.cc/j56q20rB/images.jpg");
        setDescription("");
        navigation.navigate("EditCategoriesList", { refreshList: true });
      }
    } catch (error) {
      showToast("error", "Category doesn't meet the required standard", error.message);
    }
  };

  const uploadImage = async (image) => {
    setUploading(true);
    try {
      const formData = new FormData();
      const fileType = image.split(".").pop();
      formData.append("profilePicture", {
        uri: image,
        name: `categoryImage.${fileType}`,
        type: `image/${fileType}`,
      });

      const response = await axios.post(`${BACKEND_PORT}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setUploading(false);
        return response.data.fileUrl;
      } else {
        throw new Error("Image upload failed");
      }
    } catch (err) {
      showToast("error", "Image upload failed", "Please try again.");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (result.granted === false) {
      alert("Permission to access gallery is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 2.5],
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      const pickedUri = pickerResult.assets[0].uri;
      setImage(pickedUri);
    }
  };

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2 ? text2 : "",
      visibilityTime: 3000,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.upperRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
            <Icon name="backbutton" size={26} />
          </TouchableOpacity>
          <Text style={styles.heading}>ADD CATEGORY</Text>
          <TouchableOpacity style={styles.buttonWrap} onPress={handleAddCategory}>
            <Icon name="add" size={26} />
          </TouchableOpacity>
        </View>

        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <View style={styles.lowerRow}>
            <View style={styles.form}>
              <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                ) : (
                  <Image source={require("../../../assets/images/empty-product.png")} style={styles.imagePreview} />
                )}
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Category Title"
                value={title}
                onChangeText={(text) => setTitle(text)}
              />

              <TextInput
                style={styles.descriptionInput}
                placeholder="Category Description"
                value={description}
                onChangeText={(text) => setDescription(text)}
                multiline
              />

              <View style={styles.imageUrlContainer}>
                <TextInput
                  style={[styles.input, styles.imageurl, !isEditable && styles.nonEditable]}
                  placeholder="Image URL"
                  value={imageUrl}
                  onChangeText={(text) => setImageUrl(text)}
                  editable={isEditable}
                />
                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditable(!isEditable)}>
                  <Icon name="pencil" size={27} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddCategory}>
                {uploading ? (
                  <ActivityIndicator size={30} color={COLORS.themew} />
                ) : (
                  <Text style={styles.submitText}>Add Category</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {refreshing && (
          <View style={styles.overlay}>
            <ActivityIndicator size={30} color={COLORS.themey} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  upperRow: {
    width: SIZES.width - 14,
    marginHorizontal: SIZES.xSmall - 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    zIndex: 999,
    height: 120,
  },
  backBtn: {
    left: 10,
  },
  buttonWrap: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 10,
  },
  imagePicker: {
    height: 200,
    width: 200,
    borderRadius: 300,
    alignSelf: "center",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderBlockColor: COLORS.gray,
    borderWidth: 1,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 300,
  },
  imagePlaceholder: {
    color: "gray",
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.themeg,
    padding: 10,
    borderRadius: SIZES.medium,
    marginBottom: 10,
    width: SIZES.width - 30,
    marginStart: 10,
  },
  descriptionInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.themeg,
    padding: 10,
    borderRadius: SIZES.medium,
    marginBottom: 10,
    width: SIZES.width - 30,
    marginStart: 10,
    textAlignVertical: "top",
    height: 100,
  },
  nonEditable: {
    backgroundColor: "lightgray",
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingLeft: 10,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.medium,
    alignItems: "center",
  },
  submitText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  pickerWrapper: {
    marginBottom: 10,
    marginstart: 10,
    paddingLeft: 10,
  },
  pickerLabel: {
    marginBottom: 5,
    fontWeight: "bold",
    color: COLORS.themeb,
  },
  picker: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    color: COLORS.black,
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
  },
  heading: {
    fontFamily: "bold",
    textTransform: "uppercase",
    fontSize: SIZES.large,
    textAlign: "center",
    color: COLORS.themeb,
  },
  lowerRow: {
    marginTop: 130,
    padding: 10,
    marginBottom: 60,
  },
  imageurl: {
    width: SIZES.width - 70,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 4,
  },
  editButton: {
    height: 40,
    width: 40,
    backgroundColor: COLORS.gray2,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  imageUrlContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AddCategory;
