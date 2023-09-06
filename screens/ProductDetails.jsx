import { View, Text } from "react-native";
import React, { useState } from "react";
import "./ProductDetails.style";
import styles from "./ProductDetails.style";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { TouchableOpacity, Image } from "react-native";
import { COLORS, SIZES } from "../constants";

const ProductDetails = ({ navigation }) => {
  const [count, setCount] = useState(1);

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

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
          <Text style={styles.title}>Product</Text>
          <View style={styles.priceWrapper}>
            <Text style={styles.price}>$ 670.78</Text>
          </View>
        </View>

        <View style={styles.ratingRow}>
          <View style={styles.rating}>
            {[1, 2, 3, 4, 5].map((index) => (
              <Ionicons key={index} name="star" color="gold" size={24} />
            ))}
            <Text> (4.9) </Text>
          </View>

          <View style={styles.rating}>
            <TouchableOpacity onPress={() => increment()}>
              <SimpleLineIcons name="plus" size={20} />
            </TouchableOpacity>
            <Text> {count} </Text>
            <TouchableOpacity onPress={() => decrement()}>
              <SimpleLineIcons name="minus" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.descriptionWrapper}>
          <Text style={styles.description}>Description</Text>
          <Text style={styles.descText}>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages
          </Text>
        </View>

        <View style={{marginBottom: SIZES.small}}>
              <View style={styles.location}>
                
              </View>
        </View>

      </View>
    </View>
  );
};

export default ProductDetails;
