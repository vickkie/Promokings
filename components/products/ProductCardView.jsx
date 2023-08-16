import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import styles from "./ProductCardView.style";
import {Ionicons} from '@expo/vector-icons';
import { COLORS } from "../../constants";
import { useNavigation } from "@react-navigation/native";

const ProductCardView = () => {
    const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.navigate("ProductDetails")}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: "https://media.istockphoto.com/id/1373329869/photo/modern-living-room-interior-3d-render.webp?b=1&s=170667a&w=0&k=20&c=npJvK3ITd99aF715CH3dzceECPdpzNhlnhBjv_xzL0Q=",
            }}
            style={styles.image}
          />
          <View style={styles.details}>
            <Text style={styles.title} numberOfLines={1}>Product</Text>
            <Text style={styles.supplier} numberOfLines={1}>Product</Text>
            <Text style={styles.price}>$2231</Text>

            <TouchableOpacity style={styles.addBtn}>
                <Ionicons name="add-circle" size={35} color={COLORS.primary} />
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCardView;
