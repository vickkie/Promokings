import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import { Ionicons, SimpleLineIcons, Fontisto } from "@expo/vector-icons";
import { COLORS } from "../../constants";
import styles from "./productdetails.style";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";

const ProductDetails = ({ navigation }) => {
  const route = useRoute();
  const { item } = route.params;

  const [isWished, setIsWished] = useState(false);
  const [count, setCount] = useState(1);

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  // Function to toggle the heart state
  const addWishlist = () => {
    setIsWished(!isWished);
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.upperRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-circle" size={32} />
          </TouchableOpacity>
          <TouchableOpacity onPress={addWishlist}>
            {isWished ? (
              <Ionicons name="heart" size={32} color={COLORS.primary} />
            ) : (
              <Ionicons name="heart-outline" size={32} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </View>
        <Animated.Image source={{ uri: item.imageUrl }} sharedTransitionTag={`${item._id}`} style={styles.image} />

        <View style={styles.details}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Product details</Text>
            <View style={styles.priceWrapper}>
              <Text style={styles.price}>{item.price}</Text>
            </View>
          </View>
          <View style={styles.ratingRow}>
            <View style={styles.rating}>
              {[1, 2, 3, 4, 5].map((index) => (
                <Ionicons key={index} name="star" size={16} color="gold" />
              ))}
              <Text style={styles.ratingText}>(5.0)</Text>
            </View>

            <View style={styles.toggleAmount}>
              <TouchableOpacity
                style={styles.addmore}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={increment}
              >
                <SimpleLineIcons name="plus" size={26} />
              </TouchableOpacity>
              <Text style={styles.ratingText}>( {count}) </Text>

              <TouchableOpacity onPress={decrement} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <SimpleLineIcons name="minus" size={26} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.descriptionWrapper}>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.descText}></Text>
          </View>

          <View style={styles.cartRow}>
            <TouchableOpacity onPress={() => {}} style={styles.cartBtn}>
              <Text style={styles.cartTitle}>Order now</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {}} style={styles.addBtn}>
              <Fontisto name="shopping-bag" color={COLORS.lightWhite} size={17}></Fontisto>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProductDetails;
