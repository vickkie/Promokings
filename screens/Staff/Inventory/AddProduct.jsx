import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "../../../constants/icons";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import Toast from "react-native-toast-message";
import { COLORS, SIZES } from "../../../constants";
import { ScrollView } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker";
import useFetch from "../../../hook/useFetch";

const AddProduct = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [productId, setProductId] = useState(generateProductId());
  const [image, setImage] = useState(null);
  const [loader, setLoader] = useState(false);
  const [category, setCategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [description, setDescription] = useState("");

  const { data: categories, isLoading: isCategoriesLoading, error: categoriesError } = useFetch("category");

  // Adjusted suppliers array to match expected object structure
  const suppliers = [{ id: "KINGS_COLLECTION", name: "Kings Collection" }];

  useEffect(() => {
    // console.log(categories);
  }, [categories]);

  function generateProductId() {
    const randomId = Math.random().toString(36).substr(2, 7).toUpperCase();
    return `PRK-P${randomId}`;
  }

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Product title is required"),
    price: Yup.number().required("Price is required").positive("Price must be a positive number"),
    imageUrl: Yup.string().url("Must be a valid URL").required("Image URL is required"),
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
      imageUrl: image ? image : imageUrl,
      category,
      supplier,
      description,
    };

    // Validate with Yup
    validationSchema
      .validate(newProduct)
      .then(async () => {
        if (image) {
          await uploadImageAndSaveProduct(newProduct);
        } else {
          console.log("New Product:", newProduct);
          // Send newProduct to your backend or save it
        }
      })
      .catch((error) => {
        console.log("Validation Error:", error);
        showToast("error", "Validation Error", error.message);
      });
  };

  const uploadImageAndSaveProduct = async (product) => {
    setLoader(true);
    try {
      const formData = new FormData();
      const fileType = image.split(".").pop();

      formData.append("image", {
        uri: image,
        name: `productImage.${fileType}`,
        type: `image/${fileType}`,
      });

      const response = await axios.post(`${BACKEND_PORT}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        product.imageUrl = response.data.imageUrl; // Update the imageUrl with the URL from the response
        console.log("Product with Uploaded Image:", product);
        // Send product to your backend or save it

        const endpoint = `${BACKEND_PORT}/api/user/products`;

        const response = await axios.put(endpoint, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status === 200) {
          showToast("success", "Product added successfully!");
        }
      }
    } catch (err) {
      console.log(err);
      showToast("error", "Image upload failed", "Please try again.");
    }
    setLoader(false);
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
      aspect: [4, 3],
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
          <Text style={styles.heading}>ADD PRODUCT</Text>
          <TouchableOpacity style={styles.buttonWrap} onPress={handleAddProduct}>
            <Icon name="add" size={26} />
          </TouchableOpacity>
        </View>

        <ScrollView>
          <View style={styles.lowerRow}>
            <View style={styles.form}>
              <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                ) : (
                  <Text style={styles.imagePlaceholder}>Pick an image</Text>
                )}
              </TouchableOpacity>

              <TextInput
                style={[styles.input, styles.nonEditable]}
                placeholder="Product ID"
                value={productId}
                editable={false}
              />
              <TextInput
                style={styles.input}
                placeholder="Product Title"
                value={title}
                onChangeText={(text) => setTitle(text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Price"
                value={price}
                onChangeText={(text) => setPrice(text)}
                keyboardType="numeric"
              />
              <View style={styles.availabilityRow}>
                <Text>Available:</Text>
                <Switch value={availability} onValueChange={(value) => setAvailability(value)} />
              </View>

              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>Category</Text>
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue) => setCategory(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a category" value="" />
                  {categories &&
                    categories.map((cat) => {
                      console.log(cat.title);
                      return <Picker.Item key={cat._id} label={cat.title} value={cat._id} />;
                    })}
                </Picker>
              </View>

              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>Supplier</Text>
                <Picker
                  selectedValue={supplier}
                  onValueChange={(itemValue) => setSupplier(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a supplier" value="" />
                  {suppliers && suppliers.map((sup) => <Picker.Item key={sup.id} label={sup.name} value={sup.id} />)}
                </Picker>
              </View>

              <TextInput
                style={styles.descriptionInput}
                placeholder="Product Description"
                value={description}
                onChangeText={(text) => setDescription(text)}
                multiline
              />

              <TextInput
                style={styles.input}
                placeholder="Image URL"
                value={imageUrl}
                onChangeText={(text) => setImageUrl(text)}
              />
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddProduct}>
                <Text style={styles.submitText}>Add Product</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderRadius: 8,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  imagePlaceholder: {
    color: "gray",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  descriptionInput: {
    height: 100,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    textAlignVertical: "top", // Ensures text starts at the top of the box
  },
  nonEditable: {
    backgroundColor: "lightgray",
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: {
    color: "white",
    fontWeight: "bold",
  },
  pickerWrapper: {
    marginBottom: 10,
  },
  pickerLabel: {
    marginBottom: 5,
    fontWeight: "bold",
  },
  picker: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    color: COLORS.textColor, // Set text color
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
});

export default AddProduct;
