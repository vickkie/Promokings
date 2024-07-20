import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./products.style";
import ProductList from "../components/products/ProductList";
import Icon from "../constants/icons";
import { useCart } from "../contexts/CartContext";
import { useWish } from "../contexts/WishContext";

const Products = ({ navigation }) => {
  const { itemCount } = useCart();
  const { wishCount } = useWish();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.upperRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.buttonWrap}>
            <Icon size={30} name="backbutton" />
          </TouchableOpacity>
          <Text style={styles.heading}>Products</Text>
          <View style={styles.lovebuy}>
            <TouchableOpacity onPress={() => navigation.navigate("Favourites")} style={styles.buttonWrap1}>
              <Icon size={30} name="heart" />
              <View style={styles.numbers}>
                {wishCount !== 0 ? (
                  <Text style={styles.number}>{wishCount}</Text>
                ) : (
                  <Text style={styles.number}>0</Text>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Cart")} style={styles.buttonWrap1}>
              <Icon size={30} name="cart" />
              <View style={styles.numbers}>
                {itemCount !== 0 ? (
                  <Text style={styles.number}>{itemCount}</Text>
                ) : (
                  <Text style={styles.number}>0</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <ProductList />
      </View>
    </SafeAreaView>
  );
};

export default Products;
