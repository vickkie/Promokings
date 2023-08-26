import { View, Text } from "react-native";
import React from "react";
import "./ProductDetails.style";
import styles from "./ProductDetails.style";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Image } from "react-native";
import { COLORS } from "../constants";

const ProductDetails = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.upperRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons size={30} name="chevron-back-circle" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}}>
          <Ionicons size={30} name="heart" color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <Image
        style={styles.image}
        source={{
          uri: "https://media.istockphoto.com/id/1373329869/photo/modern-living-room-interior-3d-render.webp?b=1&s=170667a&w=0&k=20&c=npJvK3ITd99aF715CH3dzceECPdpzNhlnhBjv_xzL0Q=",
        }}
      />

      <View style={styles.details}>
        <View style={styles.titleRow}>
          <Text>Title Row</Text>
        </View>
      </View>
    </View>
  );
};

export default ProductDetails;
