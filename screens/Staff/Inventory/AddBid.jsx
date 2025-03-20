import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
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
import DatePicker from "react-native-date-picker"; // Import date picker
import { BACKEND_PORT } from "@env";

const AddBid = () => {
  const navigation = useNavigation();
  const [productName, setProductName] = useState("");
  const [expectedPrice, seExpectedPrice] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [bidDescription, setBidDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("https://i.postimg.cc/j56q20rB/images.jpg");
  const [deadline, setDeadline] = useState(new Date()); // Deadline state
  const [open, setOpen] = useState(false); // Controls DatePicker modal

  const [image, setImage] = useState(null);
  const [loader, setLoader] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      // Reset form fields
      setProductName("");
      seExpectedPrice("");
      setImageUrl("https://i.postimg.cc/j56q20rB/images.jpg");
      setImage(null);
      setBidDescription("");
      setQuantity(0);
      setDeadline(new Date());
    } catch (error) {
      console.log("refresh failed");
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 2000);
    }
  }, []);

  const toggleEditable = () => {
    setIsEditable(!isEditable);
  };

  const validationSchema = Yup.object().shape({
    productName: Yup.string().required("Product Name is required"),
    expectedPrice: Yup.number().required("Price is required").positive("Price must be a positive number"),
    bidDescription: Yup.string().required("Description is required"),
    deadline: Yup.date().required("Deadline is required"),
  });

  const handleAddBid = async () => {
    const newBidRequest = {
      productName,
      quantity,
      expectedPrice,
      bidDescription,
      deadline, // include deadline in the request
    };

    try {
      if (image) {
        const uploadedImageUrl = await uploadImage(image);
        setImageUrl(uploadedImageUrl);
        newBidRequest.imageUrl = uploadedImageUrl;
      }

      // Validate with Yup
      await validationSchema.validate(newBidRequest);

      // Send bid to backend (Make sure you have the correct request ID)
      const response = await axios.post(`${BACKEND_PORT}/api/inventory-requests`, newBidRequest);

      if (response.status === 200 || response.status === 201) {
        showToast("success", "Bid added successfully!");

        // Reset form fields
        setProductName("");
        seExpectedPrice("");
        setBidDescription("");
        setQuantity(0);
        setImageUrl("https://i.postimg.cc/j56q20rB/images.jpg");
        setDeadline(new Date());

        // Navigate back to inventory dashboard
        navigation.navigate("Inventory Navigation", {
          screen: "InventoryDashboard",
          params: { refreshList: true },
        });
      }
    } catch (error) {
      console.log(error);
      showToast("error", "Failed to add bid", error.message);
    }
  };

  const uploadImage = async (image) => {
    setLoader(true);
    setUploading(true);
    try {
      const formData = new FormData();
      const fileType = image.split(".").pop(); // Extract the file extension

      formData.append("file", {
        uri: image,
        name: `productImage.${fileType}`, // Use the extracted file extension
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
          <Text style={styles.heading}>ADD NEW PRODUCT BID</Text>
          <TouchableOpacity style={styles.buttonWrap} onPress={() => {}}>
            <Icon name="megaphone" size={26} />
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
                placeholder="Product Title"
                value={productName}
                onChangeText={(text) => setProductName(text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Expected Price"
                value={expectedPrice}
                onChangeText={(text) => seExpectedPrice(text)}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.descriptionInput}
                placeholder="Bid Product Description"
                value={bidDescription}
                onChangeText={(text) => setBidDescription(text)}
                multiline
              />

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

              <View style={{ marginTop: 20 }}>
                <TextInput
                  style={styles.input}
                  placeholder="Quantity"
                  value={quantity.toString()}
                  onChangeText={(text) => setQuantity(text)}
                  keyboardType="numeric"
                />
              </View>

              {/* Deadline Picker */}
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 16, marginBottom: 5 }}>Select Deadline</Text>
                <TouchableOpacity
                  onPress={() => setOpen(true)}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 5, borderColor: COLORS.gray }}
                >
                  <Text>{deadline.toDateString()}</Text>
                </TouchableOpacity>
                <DatePicker
                  modal
                  open={open}
                  date={deadline}
                  mode="date"
                  minimumDate={new Date()} // Prevent selecting past dates
                  onConfirm={(selectedDate) => {
                    setOpen(false);
                    setDeadline(selectedDate);
                  }}
                  onCancel={() => {
                    setOpen(false);
                  }}
                />
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddBid}>
                {uploading ? (
                  <ActivityIndicator size={30} color={COLORS.themew} />
                ) : (
                  <Text style={styles.submitText}>Add New Bid</Text>
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
    marginTop: 10,
    paddingVertical: 20,
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
    fontSize: SIZES.medium,
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

export default AddBid;
