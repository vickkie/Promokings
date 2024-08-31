import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
} from "react-native";
import { COLORS, SIZES } from "../constants";
import Icon from "../constants/icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../components/auth/AuthContext";

const Orders = () => {
  const [userId, setUserId] = useState(null);
  const { userData, userLogin } = useContext(AuthContext);
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
      navigation.navigate("Login");
      return;
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const data = [
    // Your data here
  ];

  const filterOrders = () => {
    return data.filter(
      (order) =>
        (selectedStatus === "All" || order.status === selectedStatus) &&
        order.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const Card = ({ title, image, shippingId, color, stylez }) => {
    const parsedStyle = stylez ? JSON.parse(stylez) : {}; // Parse the stylez string to an object
    return (
      <View
        style={{
          backgroundColor: color || "#FFF",
          height: 170,
          width: 250,
          borderRadius: SIZES.medium,
          overflow: "hidden",
        }}
      >
        <View style={styles.cardContent}>
          <Image source={image} style={[styles.image, parsedStyle]} />
          <View style={{ gap: 10, flexDirection: "column" }}>
            <Text style={styles.title}>{title}</Text>
            <View style={{ alignSelf: "flex-start" }}>
              <Text style={styles.shippingId}>{`ID: ${shippingId}`}</Text>
            </View>
          </View>
          <View>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonView]}>
              <Icon name="backbutton" size={26} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
};
