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
import SupplierBid from "../../../components/bottomsheets/SupplierBid";

// Function to cache image
const cacheImage = async (uri) => {
  try {
    const fileName = encodeURIComponent(uri.replace(/[^a-zA-Z0-9]/g, "_"));
    const fileUri = FileSystem.documentDirectory + fileName;
    const { exists } = await FileSystem.getInfoAsync(fileUri);
    if (!exists) {
      await FileSystem.downloadAsync(uri, fileUri);
    }
    return fileUri;
  } catch (error) {
    return uri;
  }
};

const RequestCard = ({ item, isGridView }) => {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(false);
  const [bidAccepted, setBidAccepted] = useState(false);
  const [lostBid, setLostBid] = useState(false);
  const { userData } = useContext(AuthContext);

  useEffect(() => {
    const loadImage = async () => {
      if (item.imageUrl) {
        const cachedUri = await cacheImage(item.imageUrl);
        setImageUri(cachedUri);
      }
    };
    loadImage();
  }, [item.imageUrl]);

  const transitionTag = item._id ? `${item._id}` : null;
  const BottomSheetRef = useRef(null);
  const openMenu = () => BottomSheetRef.current?.present();

  //  const filteredBids =
  //    !loading && bidData && bidData[0]?.bids ? bidData[0].bids.filter((bid) => bid.supplier !== null) : [];

  //  useEffect(() => {
  //    !loading && bidData && userData?.supplierProfile?._id
  //      ? filteredBids.find((bid) => {
  //          if (bid.supplier._id === userData.supplierProfile._id) {
  //            setHaveBid(true);
  //            setOldBid(bid?.bidPrice);
  //          }
  //        })
  //      : null;
  //  }, [loading, bidData]);

  console.log(item?.selectedSupplier);

  useEffect(() => {
    if (item?.selectedSupplier === userData?.supplierProfile?._id) {
      console.log("what");
      setBidAccepted(true);
    } else if (item?.selectedSupplier !== null) {
      setLostBid(true);
    }
  }, []);
  return (
    <>
      <SupplierBid ref={BottomSheetRef} bidAccepted={bidAccepted} lostBid={lostBid} item={item} />
      <TouchableOpacity onPress={openMenu}>
        <View
          style={[
            !isGridView ? styles.container : styles.gridCard,
            { backgroundColor: bidAccepted ? "#a3eed8" : lostBid ? "#F3D0CE" : COLORS.themeg },
          ]}
        >
          <View style={isGridView ? styles.imageContainer : styles.imageList}>
            <Image
              source={{ uri: imageUri || item.imageUrl }}
              style={styles.image}
              sharedTransitionTag={transitionTag}
            />
          </View>
          <View style={styles.details}>
            <Text style={styles.title} numberOfLines={1}>
              {item?.productName}
            </Text>
            <Text style={styles.supplier} numberOfLines={1}>
              {`${item.quantity} units`}
            </Text>

            <Text style={[styles.price, { color: item.status === "Accepted" ? "#fff" : "red" }]}>
              Status:{" "}
              {item?.status === "Pending" ? "Open Bid" : lostBid ? "Bid Lost" : bidAccepted ? "Won Bid" : "Pending"}
            </Text>
          </View>
          <TouchableOpacity style={isGridView ? styles.addBtn : styles.editPencil} onPress={openMenu}>
            <Icon name="pencil" size={27} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </>
  );
};

export default RequestCard;

const styles = StyleSheet.create({
  container: {
    marginEnd: 10,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themeg,
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
  supplier: {
    fontSize: SIZES.medium,
    paddingVertical: SIZES.small - 7,
  },
  price: {
    fontFamily: "medium",
  },
  bidDescription: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: 5,
  },
  status: {
    fontSize: SIZES.small,
    fontWeight: "bold",
    color: "orange", // Change color logic if needed
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
