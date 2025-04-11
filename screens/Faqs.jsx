import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import Collapsible from "react-native-collapsible";
import Icon from "../constants/icons";
import { SIZES, COLORS } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import useFetch from "../hook/useFetch";
import LottieView from "lottie-react-native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Faqs = ({ navigation }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const { data, isLoading, error } = useFetch("faqs");
  const [faqData, setFaqs] = useState([]);

  const toggleExpand = (index) => {
    setExpandedIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  // Check network and use either cache or fresh data
  useEffect(() => {
    const checkAndLoadFaqs = async () => {
      const net = await NetInfo.fetch();

      if (net.isConnected) {
        // We're online, use fresh data + save to cache
        if (data && Array.isArray(data)) {
          setFaqs(data);
          await AsyncStorage.setItem("cachedFaqs", JSON.stringify(data));
        }
      } else {
        // Offline? Load from cache
        const cached = await AsyncStorage.getItem("cachedFaqs");
        if (cached) {
          setFaqs(JSON.parse(cached));
          console.log("📴 Offline: FAQs loaded from cache.");
        }
      }
    };

    checkAndLoadFaqs();
  }, [data]);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Error fetching FAQs: {error.message}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.upperRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
          <Icon name="backbutton" size={26} />
        </TouchableOpacity>
        <Text style={styles.heading}>Frequently asked</Text>
        <TouchableOpacity
          style={styles.buttonWrap}
          onPress={() => {
            navigation.navigate("Help");
          }}
        >
          <Icon name="messagefilled" size={26} />
        </TouchableOpacity>
      </View>

      <View style={styles.lowerRow}>
        {isLoading ? (
          <View style={styles.containLottie}>
            <View style={styles.animationWrapper}>
              <LottieView source={require("../assets/data/loading.json")} autoPlay loop style={styles.animation} />
            </View>
          </View>
        ) : (
          <ScrollView>
            {Array.isArray(faqData) &&
              faqData.map((faq, index) => (
                <View key={index}>
                  <TouchableOpacity style={styles.header} onPress={() => toggleExpand(index)}>
                    <Text style={styles.question}>{faq.question}</Text>
                  </TouchableOpacity>
                  <Collapsible collapsed={expandedIndex !== index}>
                    <View style={styles.body}>
                      <Text>{faq.answer}</Text>
                    </View>
                  </Collapsible>
                </View>
              ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  upperRow: {
    width: SIZES.width - 14,
    marginHorizontal: SIZES.xSmall - 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.large,
    top: SIZES.xLarge + 10,
    zIndex: 999,
    height: 120,
  },
  heading: {
    fontFamily: "medium",
    fontSize: SIZES.medium,
  },
  backBtn: {
    left: 10,
  },
  buttonWrap: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 10,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.themeg,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  question: {
    fontSize: 16,
    fontWeight: "bold",
  },
  body: {
    padding: 16,
  },
  lowerRow: {
    marginTop: 132,
    width: SIZES.width - 16,
    borderRadius: SIZES.medium,
    marginStart: 8,
    overflow: "hidden",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  containLottie: {
    justifyContent: "center",
    alignItems: "center",
    width: SIZES.width - 20,
    flex: 1,
  },
  animationWrapper: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  animation: {
    width: "100%",
    height: "100%",
  },
});

export default Faqs;
