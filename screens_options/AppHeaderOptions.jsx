import { Text, StyleSheet } from "react-native";
import { COLORS, SIZES } from "../constants";

const chatScreenOptions = {
  headerTitle: () => <Text style={styles.topheader}>Talk to assistant agent</Text>,
  headerStyle: {
    backgroundColor: COLORS.themey,
  },
  headerTintColor: "#fff",
  headerTitleStyle: {
    fontWeight: "bold",
  },
};

const faqsScreenOptions = {
  headerTitle: () => <Text style={{ color: "#fff" }}>Home</Text>,
  headerStyle: {
    backgroundColor: "#f4511e",
  },
  headerTintColor: "#fff",
  headerTitleStyle: {
    fontWeight: "bold",
  },
  // Additional options...
};
const successScreenOptions = {
  headerTitle: () => <Text style={{ color: "#fff" }}>Order status</Text>,
  headerStyle: {
    backgroundColor: "#f4511e",
  },
  headerTintColor: "#fff",
  headerTitleStyle: {
    fontWeight: "bold",
  },
  // Additional options...
};
const systemScreenOptions = {
  headerTitle: () => <Text style={{ color: "#fff", fontSize: SIZES.large }}> Notifications</Text>,
  headerStyle: {
    backgroundColor: COLORS.themey,
  },
  headerTintColor: "#fff",
  headerTitleStyle: {
    fontWeight: "bold",
  },
};
const AboutScreenOptions = {
  headerTitle: () => <Text style={{ color: COLORS.themeb, fontSize: SIZES.large }}>About</Text>,
  headerStyle: {
    backgroundColor: COLORS.themew,
    elevation: 0,
    shadowOpacity: 0,
    shadowOffset: { height: 0, width: 0 },
    shadowRadius: 0,
  },
  headerTintColor: COLORS.themeb,
  headerTitleStyle: {
    fontWeight: "bold",
  },
};

const styles = StyleSheet.create({
  topheader: { color: "#fff", fontFamily: "bold", fontSize: SIZES.medium },
});

export { chatScreenOptions, faqsScreenOptions, systemScreenOptions, AboutScreenOptions, successScreenOptions };
