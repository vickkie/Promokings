import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import { Ionicons, SimpleLineIcons, Fontisto } from "@expo/vector-icons";
import { COLORS } from "../../constants";
import styles from "./productdetails.style";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import Icon from "../../constants/icons";

const ProductDetails = ({ navigation }) => {
  const route = useRoute();
  const { item } = route.params;
  const [isWished, setIsWished] = useState(false);
  const [count, setCount] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const sizes = ["XS", "S", "M", "L", "XL"];

  const [processedDescription, setProcessedDescription] = useState("");

  // Function to process the description
  const processDescription = () => {
    // Splitting the description by full stops
    const splitDescription = item.description.split(". ");
    const firstLine = splitDescription[0];
    setProcessedDescription(firstLine);
  };

  // Call the function to process the description when the component mounts
  React.useEffect(() => {
    processDescription();
  }, [item.description]);

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

  const transitionTag = item._id ? `${item._id}` : null;

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
        {/* Displaying the image */}
        <View style={styles.imageWrapper}>
          <Animated.Image source={{ uri: item.imageUrl }} sharedTransitionTag={transitionTag} style={styles.image} />
        </View>
        {/* Displaying the product details */}
        <View style={styles.containerWrapper}>
          <View style={styles.details}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{item.title}</Text>
            </View>
            <View style={styles.ratingRow}>
              <View style={styles.priceWrapper}>
                <Text style={styles.price}>{item.price}</Text>
              </View>
              <View style={styles.rating}>
                {[1, 2, 3, 4, 5].map((index) => (
                  <Ionicons key={index} name="star" size={16} color="gold" />
                ))}
                <Text style={styles.ratingText}>(5.0)</Text>
              </View>
            </View>

            {/* Size selection */}
            <View style={styles.sizeWrapper}>
              <View style={styles.sizeInnerWrapper}>
                <Text style={styles.sizeHeader}>Select Size:</Text>
              </View>
              <View style={styles.sizeButtons}>
                {sizes.map((size, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.sizeButton, selectedSize === size && styles.selectedSizeButton]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text style={[styles.sizeButtonText, selectedSize === size && styles.selectedSizeButtonText]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            {!isExpanded ? (
              <View style={styles.shortDescription}>
                <Text style={styles.description}>{processedDescription}.</Text>
              </View>
            ) : (
              ""
            )}

            <TouchableOpacity style={styles.expandableHeader} onPress={() => setIsExpanded(!isExpanded)}>
              <Text style={styles.expandableHeaderText}>{isExpanded ? "Less Description" : " Description"}</Text>
              {!isExpanded ? <Icon name={"down"} size={24} /> : <Icon name={"up"} size={24} />}
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.expandableContent}>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            )}

            {/* Cart buttons */}
            <View style={styles.cartRow}>
              <TouchableOpacity onPress={() => {}} style={styles.cartBtn}>
                <Text style={styles.cartTitle}>Order now</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {}} style={styles.addBtn}>
                <Fontisto name="shopping-bag" color={COLORS.lightWhite} size={17} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProductDetails;
