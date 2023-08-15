import { View, Text, TouchableOpacity, Image} from "react-native";
import React from "react";
import styles from "./ProductCardView.style";

const ProductCardView = () => {
  return (
    <TouchableOpacity onPress={() => {}}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
            <Image source={{uri:'https://thumbs.dreamstime.com/b/furniture-store-interior-modern-home-office-china-asia-59188080.jpg'}}
            style={styles.image} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCardView;
