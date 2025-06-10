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

const AddProduct = () => {
  const route = useRoute();
  // console.log(route?.params?.product);
  const initialProduct = route?.params?.product;

  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState(false);
  const [imageUrl, setImageUrl] = useState("https://i.postimg.cc/j56q20rB/images.jpg");
  const [productId, setProductId] = useState(generateProductId());
  const [image, setImage] = useState(null);
  const [loader, setLoader] = useState(false);
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(initialProduct?.quantity || 0);
  const [supplier, setSupplier] = useState("");
  const [sizeApplicable, setSizeApplicable] = useState(true);
  const [description, setDescription] = useState("");
  const [isEditable, setIsEditable] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const { data: categories, isLoading: isCategoriesLoading, error: categoriesError } = useFetch("category");

  const { data: supplierData, isLoading: isSuppliersLoading, error: supplierError } = useFetch("v2/supplier/names");

  console.log(supplierData);

  useEffect(() => {
    if (initialProduct) {
      // console.log(initialProduct?.quantity);
      setTitle(initialProduct?.productName);
      setPrice();
      setAvailability(true);
      setSizeApplicable(false);
      setImageUrl(initialProduct?.imageUrl);
      setProductId(generateProductId());
      setImage(initialProduct?.imageUrl);
      setCategory("");
      setDescription("");
      setQuantity(initialProduct?.quantity);

      const selectedId = initialProduct?.selectedSupplier;

      const selectedSupplier = supplierData?.suppliers?.find((supplier) => supplier._id === selectedId);

      if (selectedSupplier) {
        console.log("Found supplier:", selectedSupplier.name);
        setSupplier(selectedSupplier.name);
      } else {
        console.log("No supplier found");
      }
    }

    console.log("my", quantity);
  }, [initialProduct, supplierData]);

  useEffect(() => {
    if (!isSuppliersLoading && !supplierError && supplierData) {
      setSuppliers(supplierData?.suppliers);
    }

    return () => {
      // console.log(supplierData?.suppliers);
    };
  }, [supplierData, isSuppliersLoading, supplierError]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      // Reset form fields
      setTitle("");
      setPrice("");
      setAvailability(false);
      sizeApplicable(true);
      setImageUrl("https://i.postimg.cc/j56q20rB/images.jpg");
      setProductId(generateProductId());
      setImage(null);
      setCategory("");
      setSupplier("");
      setDescription("");
      setQuantity(0);
    } catch (error) {
      console.log("refresh failed");
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 2000);
    }
  }, []);

  function generateProductId() {
    const randomId = Math.random().toString(36).substr(2, 7).toUpperCase();
    return `PRK-P${randomId}`;
  }
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

  const handleAddProduct = async () => {
    const newProduct = {
      productId,
      title,
      price,
      availability,
      imageUrl: imageUrl,
      category,
      supplier,
      description,
      quantity,
    };

    try {
      if (image) {
        const uploadedImageUrl = await uploadImage(image);

        // console.log(image, uploadedImageUrl);
        setImageUrl(uploadedImageUrl);
        newProduct.imageUrl = uploadedImageUrl;
      }

      // Validate with Yup
      await validationSchema.validate(newProduct);
      // Now that the image is uploaded, proceed to add the product
      //   console.log("New Product:", newProduct);

      newProduct.sizeApplicable = sizeApplicable;

      const response = await axios.post(`${BACKEND_PORT}/api/products`, newProduct);

      if (response.status === 201) {
        showToast("success", "Product added successfully!");
        // Reset form fields
        setTitle("");
        setPrice("");
        setAvailability(false);
        setImageUrl("https://i.postimg.cc/j56q20rB/images.jpg");
        setProductId(generateProductId());
        setImage(null);
        setCategory("");
        setSupplier("");
        setDescription("");
        setQuantity(0);
        setSizeApplicable(true);

        // Navigate to dashboard
        navigation.navigate("Inventory Navigation", {
          screen: "InventoryDashboard",
          params: { refreshList: true },
        });
      }
    } catch (error) {
      console.log(error);
      showToast("error", "Product doesn't meet the required standard", error.message);
    }
  };

  const uploadImage = async (image) => {
    setLoader(true);
    setUploading(true);
    try {
      const formData = new FormData();
      const fileType = image.split(".").pop(); // Extract the file extension

      // Adjust the field name to 'profilePicture' to match the server's expectation
      formData.append("file", {
        uri: image,
        name: `productImage.${fileType}`, // Use the extracted file extension
        type: `image/${fileType}`,
      });

      // Assuming BACKEND_PORT is correctly defined to point to your server's address
      const response = await axios.post(`${BACKEND_PORT}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      //   console.log(response);

      if (response.status === 200) {
        // Update to extract 'fileUrl' from the response data

        setUploading(false);
        return response.data.fileUrl; // Return the uploaded image URL from the response
      } else {
        setAvailability(false);
        throw new Error("Image upload failed");
      }
    } catch (err) {
      //   console.log("outer layer", err);
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
      //   console.log("picked uri", pickedUri);
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
          <Text style={styles.heading}>ADD PRODUCT</Text>
          <TouchableOpacity style={styles.buttonWrap} onPress={handleAddProduct}>
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
              <Text style={styles.label}>Image url (manual)</Text>
              <View style={styles.imageurlContainer}>
                <TextInput
                  style={[styles.input, styles.imageurl, !isEditable ? styles.nonEditable : ""]}
                  placeholder="Image URL"
                  value={imageUrl}
                  onChangeText={(text) => setImageUrl(text)}
                  editable={isEditable}
                />

                <TouchableOpacity style={styles.editButton} onPress={toggleEditable}>
                  <Icon name="pencil" size={27} />
                </TouchableOpacity>
              </View>

              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>Category</Text>
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
                      //
                      return <Picker.Item key={cat._id} label={cat.title} value={cat.title} />;
                    })}
                </Picker>
              </View>

              <View style={{ marginTop: 20 }}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Quantity"
                  value={quantity?.toString() || ""}
                  onChangeText={(text) => setQuantity(text ? parseInt(text, 10) : 0)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>Supplier</Text>
                <Picker
                  selectedValue={supplier}
                  onValueChange={(itemValue) => setSupplier(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a supplier" value="" />
                  {suppliers &&
                    suppliers.map((sup) => (
                      <Picker.Item
                        key={sup._id}
                        label={sup.name}
                        value={sup.name}
                        color="black"
                        fontFamily="medium"
                        enabled={true}
                      />
                    ))}
                </Picker>
              </View>

              <View style={styles.availabilityRow}>
                <Text>Available:</Text>
                <Switch value={availability} onValueChange={(value) => setAvailability(value)} />
              </View>
              <View style={styles.availabilityRow}>
                <Text>Size Applicable:</Text>
                <Switch value={sizeApplicable} onValueChange={(value) => setSizeApplicable(value)} />
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddProduct}>
                {uploading ? (
                  <ActivityIndicator size={30} color={COLORS.themew} />
                ) : (
                  <Text style={styles.submitText}>Add Product</Text>
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
  imageurlContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
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
});

export default AddProduct;
