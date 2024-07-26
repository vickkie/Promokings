import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import Collapsible from "react-native-collapsible";
import Icon from "../constants/icons";
import { SIZES, COLORS } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import useFetch from "../hook/useFetch";

const Faqs = ({ navigation }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const { data, isLoading, error } = useFetch("faqs");
  const [faqData, setFaqData] = useState([]); // Change to an empty array

  const toggleExpand = (index) => {
    setExpandedIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  // Update faqData when data changes
  useEffect(() => {
    if (data) {
      setFaqData(data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.themeg} />
      </SafeAreaView>
    );
  }

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
        <ScrollView>
          {faqData.map((faq, index) => (
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
});

export default Faqs;
