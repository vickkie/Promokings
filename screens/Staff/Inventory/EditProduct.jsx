import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "../../../constants/icons";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import Toast from "react-native-toast-message";
import { COLORS, SIZES } from "../../../constants";
import { ScrollView } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker";
import useFetch from "../../../hook/useFetch";

import { BACKEND_PORT } from "@env";

const EditProduct = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params; // Passed from the previous screen

  const product = item;

  const [title, setTitle] = useState(product?.title || "");
  const [price, setPrice] = useState(product?.price || "");
  const [availability, setAvailability] = useState(product?.availability || false);
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "https://i.postimg.cc/j56q20rB/images.jpg");
  const [productId, setProductId] = useState(product?.productId || "");
  const [image, setImage] = useState(null);
  const [loader, setLoader] = useState(false);
  const [category, setCategory] = useState(product?.category || "");
  const [supplier, setSupplier] = useState(product?.supplier || "");
  const [description, setDescription] = useState(product?.description || "");
  const [isEditable, setIsEditable] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { data: categories, isLoading: isCategoriesLoading, error: categoriesError } = useFetch("category");

  const suppliers = [{ id: "KINGS_COLLECTION", name: "Kings Collection" }];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      // Reset form fields to original product data
      setTitle(product?.title || "");
      setPrice(product?.price || "");
      setAvailability(product?.availability || false);
      setImageUrl(product?.imageUrl || "https://i.postimg.cc/j56q20rB/images.jpg");
      setProductId(product?.productId || "");
      setImage(null);
      setCategory(product?.category || "");
      setSupplier(product?.supplier || "");
      setDescription(product?.description || "");
    } catch (error) {
      console.log("refresh failed");
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 2000);
    }
  }, [product]);

  const toggleEditable = () => {
    setIsEditable(!isEditable);
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Product title is required"),
    price: Yup.number().required("Price is required").positive("Price must be a positive number"),
    category: Yup.string().required("Category is required"),
    supplier: Yup.string().required("Supplier is required"),
    description: Yup.string().required("Description is required"),
  });

  const handleUpdateProduct = async () => {
    const updatedProduct = {
      productId,
      title,
      price,
      availability,
      imageUrl: imageUrl,
      category,
      supplier,
      description,
    };

    try {
      if (image) {
        const uploadedImageUrl = await uploadImage(image);
        setImageUrl(uploadedImageUrl);
        updatedProduct.imageUrl = uploadedImageUrl;
      }

      await validationSchema.validate(updatedProduct);

      const response = await axios.put(`${BACKEND_PORT}/api/products/${product._id}`, updatedProduct);

      if (response.status === 200) {
        showToast("success", "Product updated successfully!");
        navigation.navigate("EditProductsList", { refreshList: true });
      }
    } catch (error) {
      showToast("error", "Product update failed", error.message);
    }
  };

  const uploadImage = async (image) => {
    setLoader(true);
    setUploading(true);
    try {
      const formData = new FormData();
      const fileType = image.split(".").pop();

      formData.append("profilePicture", {
        uri: image,
        name: `productImage.${fileType}`,
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
        setAvailability(false);
        throw new Error("Image upload failed");
      }
    } catch (err) {
      showToast("error", "Image upload failed", "Please try again.");
      throw err;
    } finally {
      setLoader(false);
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
      aspect: [1, 1],
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
          <Text style={styles.heading}>UPDATE PRODUCT</Text>
          <TouchableOpacity
            style={styles.buttonWrap}
            onPress={() => {
              navigation.navigate("AddProduct");
            }}
          >
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
                  <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
                )}
              </TouchableOpacity>
              <Text style={styles.label}>Product ID</Text>
              <TextInput
                style={[styles.input, styles.nonEditable]}
                placeholder="Product ID"
                value={productId}
                editable={false}
              />
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Product Title"
                value={title}
                onChangeText={(text) => setTitle(text)}
              />
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                placeholder="Price"
                value={price}
                onChangeText={(text) => setPrice(text)}
                keyboardType="numeric"
              />
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Product Description"
                value={description}
                onChangeText={(text) => setDescription(text)}
                multiline
              />
              <Text style={styles.label}>Image url</Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TextInput
                  style={[styles.input, styles.imageurl, !isEditable ? styles.nonEditable : ""]}
                  placeholder="Image URL"
                  value={imageUrl}
                  onChangeText={(text) => setImageUrl(text)}
                  editable={isEditable}
                />

                <TouchableOpacity
                  style={{
                    height: 40,
                    width: 40,
                    backgroundColor: COLORS.gray2,
                    borderRadius: 100,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                  onPress={toggleEditable}
                >
                  <Icon name="pencil" size={27} />
                </TouchableOpacity>
              </View>

              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>Category</Text>
                <View style={styles.pickerBox}>
                  <Picker
                    selectedValue={category}
                    onValueChange={(itemValue, itemIndex) => {
                      setCategory(itemValue);
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select a category" value={""} />
                    {categories &&
                      categories.map((cat) => {
                        return <Picker.Item key={cat._id} label={cat.title} value={cat.title} />;
                      })}
                  </Picker>
                </View>
              </View>

              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>Supplier</Text>
                <View style={styles.pickerBox}>
                  <Picker
                    selectedValue={supplier}
                    onValueChange={(itemValue, itemIndex) => {
                      setSupplier(itemValue);
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select a supplier" value={""} style={styles.pickerBox} />
                    {suppliers &&
                      suppliers.map((sup) => {
                        return <Picker.Item key={sup.id} label={sup.name} value={sup.name} />;
                      })}
                  </Picker>
                </View>
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.label}>Availability</Text>
                <Switch value={availability} onValueChange={(newValue) => setAvailability(newValue)} />
              </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleUpdateProduct}>
              {uploading ? (
                <ActivityIndicator size={30} color={COLORS.themew} />
              ) : (
                <Text style={styles.submitText}>Add Product</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default EditProduct;

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
    fontFamily: "regular",
    fontSize: SIZES.xSmall,
    marginTop: 14,
    textAlign: "right",
  },

  label: {
    fontFamily: "regular",
    fontSize: SIZES.xSmall,
    marginBottom: 5,
    textAlign: "right",
  },
  picker: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    color: COLORS.black,
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
  },
  pickerBox: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "red",
    height: 50,
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
});
