import { Text, TouchableOpacity, View, Image, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import React, { useState, useContext, useEffect } from "react";
import { Ionicons, Fontisto } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../../constants";
import Icon from "../../../constants/icons";
import { AuthContext } from "../../../components/auth/AuthContext";
import useFetch from "../../../hook/useFetch";
import Toast from "react-native-toast-message";

const PreviewProduct = ({ navigation }) => {
  const route = useRoute();
  const { item } = route.params;
  const [isExpanded, setIsExpanded] = useState(false);
  const parsedPrice = item.price ? parseFloat(item.price.replace(/[^0-9.-]+/g, "")) : 0;
  const [shortDescription, setShortDescription] = useState("");

  const [itemDescription, setItemDescription] = useState(item.description || ".");
  const { userData, userLogin } = useContext(AuthContext);
  const [userId, setUserId] = useState(null);
  const { data, refetch } = useFetch(`products/${item._id}`);

  useEffect(() => {
    if (data) {
      setItemDescription(data.description);
    }
  }, [data, refetch, itemDescription]);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1); // Default user ID for demonstration purposes && test
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const processDescription = () => {
    if (itemDescription) {
      const splitDescription = itemDescription.split(". ");
      const firstLine = splitDescription[0];
      setShortDescription(firstLine);
    }
  };

  useEffect(() => {
    processDescription();
  }, [itemDescription]);

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
    });
  };

  const transitionTag = item._id ? `${item._id}` : null;

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.upperRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-circle" size={32} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              userLogin
                ? navigation.navigate("EditProduct", {
                    item: item,
                  })
                : showToast("error", "Oops!", "Please log in to continue ");
            }}
          >
            <Ionicons name="heart" size={32} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.imageUrl }} sharedTransitionTag={transitionTag} style={styles.image} />
        </View>
        <View style={styles.containerWrapper}>
          <View style={styles.details}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{item.title}</Text>
            </View>
            <View style={styles.ratingRow}>
              <View style={styles.priceWrapper}>
                <Text style={styles.price}>
                  {`KES ${new Intl.NumberFormat("en-US", { style: "currency", currency: "KES" })
                    .format(parsedPrice)
                    .replace("KES", "")
                    .trim()}`}
                </Text>
              </View>
              <View>
                <TouchableOpacity
                  onPress={() => {
                    userLogin
                      ? navigation.navigate("EditProduct", {
                          item: item,
                        })
                      : showToast("error", "Oops!", "Please log in to continue ");
                  }}
                  style={styles.helpBtn}
                >
                  <Icon name="pencil" size={27} />
                </TouchableOpacity>
              </View>
            </View>

            {!isExpanded ? (
              <View style={styles.shortDescription}>
                <Text style={styles.description}>{shortDescription}.</Text>
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

            <View style={styles.previewText}>
              <Text>Preview as it might appear</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default PreviewProduct;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  previewText: {
    fontSize: "small",
    alignSelf: "center",
    marginVertical: 10,
    color: "thistle",
  },

  upperRow: {
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    top: SIZES.xxLarge,
    width: SIZES.width - 44,
    zIndex: 999,
    height: 400,
  },
  image: {
    aspectRatio: 1,
    resizeMode: "cover",
  },
  containerWrapper: {
    marginTop: -SIZES.large,
    backgroundColor: COLORS.themew,
    paddingTop: 10,
    paddingBottom: 10,
  },

  details: {
    backgroundColor: COLORS.lightWhite,
    marginTop: 5,
    marginLeft: 5,
    marginRight: 5,
    width: SIZES.width - 10,
    borderRadius: SIZES.medium,
    borderTopRightRadius: SIZES.medium,
  },
  titleRow: {
    marginHorizontal: 10,
    paddingBottom: SIZES.xLarge,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    width: SIZES.width - 22,
    top: 20,
  },
  title: {
    fontFamily: "bold",
    fontSize: SIZES.xLarge,
  },
  priceWrapper: {
    // backgroundColor: COLORS.primary,
    borderRadius: SIZES.large,
  },
  price: {
    padding: 10,
    color: COLORS.themeb,
    fontFamily: "bold",
    fontSize: SIZES.large,
  },
  ratingRow: {
    paddingBottom: SIZES.small,
    justifyContent: "space-between",
    gap: 40,
    flexDirection: "row",
    alignItems: "center",
    width: SIZES.width - 20,
    marginHorizontal: 10,
    top: 3,
  },
  rating: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  ratingText: {
    color: COLORS.gray,
    fontFamily: "bold",
  },
  helpBtnText: {
    color: COLORS.gray,
    fontFamily: "bold",
    fontSize: SIZES.medium,
  },

  toggleAmount: {
    flexDirection: "row",
    justifyContent: "space-between",
    top: SIZES.large,
    alignItems: "center",
    gap: 6,
    paddingTop: 12,
  },
  descriptionWrapper: {
    marginTop: SIZES.large + 2,
    marginHorizontal: SIZES.large,
  },
  shortDescription: {
    marginTop: SIZES.large + 2,
    marginHorizontal: SIZES.large,
  },
  description: {
    fontFamily: "regular",
    fontSize: SIZES.large - 2,
  },
  descText: {
    fontFamily: "regular",
    fontSize: SIZES.small,
    textAlign: "justify",
  },
  cartRow: {
    paddingBottom: SIZES.small,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: SIZES.width,
  },
  cartBtn: {
    width: SIZES.width * 0.76,
    backgroundColor: COLORS.themey,
    padding: SIZES.small / 2,
    borderRadius: SIZES.large,
    marginLeft: SIZES.medium / 2,
    height: 51,
    justifyContent: "center",
    alignItems: "center",
  },
  cartTitle: {
    fontFamily: "bold",
    color: COLORS.white,
    marginLeft: SIZES.small,
  },
  addBtn: {
    height: 51,
    width: 51,
    borderRadius: 50,
    marginRight: SIZES.medium,
    backgroundColor: COLORS.themey,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: SIZES.xSmall,
  },
  sizeWrapper: {
    width: SIZES.width - 20,
    height: 70,
  },
  sizeInnerWrapper: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: SIZES.xLarge,
  },
  sizeHeader: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
  },
  sizeButtons: {
    flexDirection: "row",
    gap: 30,
    marginHorizontal: SIZES.xLarge,
  },
  sizeButton: {
    height: SIZES.xLarge + 5,
    width: SIZES.xLarge + 5,
    padding: 5,
    borderColor: COLORS.gray2,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: SIZES.xLarge,
  },
  selectedSizeButton: {
    backgroundColor: COLORS.themey,
  },
  selectedSizeButtonText: {
    color: COLORS.white,
  },
  expandableHeader: {
    height: 40,
    // width: SIZES.width ,
    marginTop: 30,
    marginBottom: 10,
    marginHorizontal: 5,
    paddingLeft: 15,
    paddingRight: 15,
    borderColor: COLORS.gray2,
    borderWidth: 1,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: SIZES.xLarge,
    flexDirection: "row",
  },
  expandableHeaderText: {
    fontFamily: "medium",
  },
  expandableContent: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 30,
    color: "red",
  },
  helpBtn: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
    padding: SIZES.small,
  },
});
