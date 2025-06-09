import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  SectionList,
  StyleSheet,
} from "react-native";
import moment from "moment";
import { AuthContext } from "../components/auth/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../constants";
import Icon from "../constants/icons";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import { db } from "../components/auth/firebase";
import { ref, onValue } from "firebase/database";
import { StatusBar } from "expo-status-bar";

const HelpListScreen = () => {
  const [chatSections, setChatSections] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { userData } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    const messagesRef = ref(db, "messages-query");
    const unsubscribers = [];

    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setChatSections([]);
        setLoading(false);
        return;
      }

      const userIds = Object.keys(data);
      const userMap = {};

      userIds.forEach((userId) => {
        const userRef = ref(db, `messages-query/${userId}/sent`);
        const unsub = onValue(userRef, (snap) => {
          const receivedMsgs = snap.val() || {};
          const sentMsgs = data[userId]?.sent || {};

          const allMessages = [...Object.values(sentMsgs), ...Object.values(receivedMsgs)];
          if (allMessages.length === 0) return;

          const latestMessage = allMessages.reduce(
            (latest, msg) => (!latest || msg.createdAt > latest.createdAt ? msg : latest),
            null
          );

          const unreadCount = Object.values(receivedMsgs).filter((msg) => msg.read === false).length;

          userMap[userId] = {
            userId,
            name: latestMessage?.user?.name || "Unknown",
            avatar: latestMessage?.user?.avatar || null,
            text: latestMessage?.text || "",
            createdAt: latestMessage?.createdAt || 0,
            unreadCount,
          };

          // Once userMap is updated, refresh chatSections
          const filtered = Object.values(userMap)
            .filter(Boolean)
            .filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()));

          const grouped = {};

          filtered.forEach((msg) => {
            const dateKey = moment(msg.createdAt).startOf("day").format();
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(msg);
          });

          const sections = Object.keys(grouped)
            .sort((a, b) => new Date(b) - new Date(a))
            .map((dateKey) => ({
              title: formatSectionHeader(dateKey),
              data: grouped[dateKey],
            }));

          setChatSections(sections);
        });

        unsubscribers.push(unsub);
      });

      setLoading(false);
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub && unsub());
    };
  }, [searchQuery]);

  const formatSectionHeader = (dateStr) => {
    const date = moment(dateStr);
    if (date.isSame(moment(), "day")) return "Today";
    if (date.isSame(moment().subtract(1, "day"), "day")) return "Yesterday";
    return date.format("MMM DD, YYYY");
  };

  const startChat = (user) => {
    navigation.navigate("HelpAgentChatScreen", {
      chatWith: {
        _id: user.userId,
        fullname: user.name,
        profilePicture: user.avatar,
        role: user?.role || "customer",
      },
      userData,
    });
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={{ paddingVertical: 8, paddingHorizontal: 14, backgroundColor: "#F0F0F0" }}>
      <Text style={{ fontWeight: "bold", fontSize: 14 }}>{title}</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => startChat(item)}
      style={{ flexDirection: "row", alignItems: "center", padding: 10, gap: 8, justifyContent: "space-between" }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <Image
          source={item.avatar ? { uri: item.avatar } : require("../assets/images/userDefault.webp")}
          style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10, marginLeft: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{item.name}</Text>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.previewText}>
            {item.text}
          </Text>
        </View>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar backgroundColor={COLORS.themey} />
      <SafeAreaView style={styles.container}>
        <View style={styles.wrapper}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
            <Icon name="backbutton" size={26} />
          </TouchableOpacity>
          <View style={styles.upperRow}>
            <Text style={styles.heading}>Assistance Messages</Text>
            <TouchableOpacity onPress={() => {}} style={styles.outWrap}>
              <Icon name="bellfilled" size={26} />
            </TouchableOpacity>
            <View style={styles.lowerheader}>
              <Text style={styles.statement}>Select a chat</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 100 }}>
          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton}>
              <Icon name="search" size={26} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.mtop}>
              <LottieView source={require("../assets/data/loading.json")} autoPlay loop style={styles.animation} />
            </View>
          ) : (
            <SectionList
              sections={chatSections}
              keyExtractor={(item) => item.userId}
              renderItem={renderItem}
              renderSectionHeader={renderSectionHeader}
              ListEmptyComponent={
                <View style={styles.containLottie}>
                  <View style={styles.animationWrapper}>
                    <LottieView
                      source={require("../assets/data/nodata.json")}
                      autoPlay
                      loop={false}
                      style={styles.animation}
                    />
                  </View>
                </View>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

export default HelpListScreen;

const styles = StyleSheet.create({
  carouselContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.themey,
    height: 90,
  },
  textStyles: {
    fontFamily: "bold",
    fontSize: 19,
  },
  appBarWrapper: {
    // marginHorizontal: 4,
    // marginTop: SIZES.small - 2,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    marginTop: 10,
  },
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    width: SIZES.width - 20,
  },
  location: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
    color: COLORS.gray,
  },
  cartContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  cartNumber: {
    position: "absolute",
    fontFamily: "regular",
    fontWeight: "800",
    fontSize: 13,
    color: COLORS.lightWhite,
    borderRadius: 700,
    backgroundColor: COLORS.themey,
  },
  cartWrapper: {
    zIndex: 11,
    backgroundColor: COLORS.themey,
    justifyContent: "center",
    padding: 10,
    borderRadius: 100,
    position: "absolute",
    right: 40,
    top: 4,
    zIndex: 77,
    alignItems: "center",
  },
  buttonWrap: {
    backgroundColor: COLORS.hyperlight,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonWrap2: {
    backgroundColor: COLORS.hyperlight,
    borderRadius: 100,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  topWelcomeWrapper: {
    minHeight: 130,
    backgroundColor: COLORS.themew,
    marginHorizontal: 4,
    borderRadius: SIZES.medium,
    // ...SHADOWS.small,
    // marginBottom: 2,
    // shadowColor: COLORS.lightWhite,
  },
  greeting: {
    flex: 1,
    justifyContent: "center",
    // alignItems: "center",
    paddingHorizontal: 20,
  },
  greetingMessage: {
    fontFamily: "bold",
    fontSize: SIZES.xxLarge,
  },
  hello: {
    fontFamily: "regular",
    color: "#BABDB6",
  },
  username: {
    fontFamily: "semibold",
    color: COLORS.themeb,
  },
  sloganWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    // alignItems: "center",
  },
  slogan: {
    fontFamily: "regular",
    color: "#BABDB6",
    fontSize: SIZES.medium,
  },
  lowerWelcome: {
    backgroundColor: COLORS.themew,
    marginHorizontal: 4,
    borderTopLeftRadius: SIZES.medium,
    borderTopRightRadius: SIZES.medium,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  lowerWelcomeWrapper: {
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
  },
  topSafeview: {
    flex: 1,
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
    marginTop: SIZES.xxSmall,
  },
  profilePicture: {
    height: 52,
    width: 52,
    borderRadius: 100,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 16,
    color: "black",
  },
  container: {
    flex: 1,
    marginTop: 30,
    backgroundColor: "#F9F9F9",
  },
  wrapper: {
    flexDirection: "column",
    position: "absolute",
    top: 2,
  },
  backBtn: {
    left: 10,
  },
  buttonView: {
    backgroundColor: COLORS.themew,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
    transform: [{ rotate: "180deg" }],
  },
  buttonWrap: {
    backgroundColor: COLORS.themeg,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    zIndex: 9,
    top: 10,
    left: 10,
  },
  upperRow: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    zIndex: 2,
    minHeight: 70,
  },
  upperButtons: {
    width: SIZES.width - 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SIZES.medium,
  },
  topprofileheading: {
    fontSize: SIZES.medium,
    textAlign: "center",
    color: COLORS.themeb,
    fontFamily: "semibold",
  },
  outWrap: {
    backgroundColor: COLORS.themeg,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 5,
    right: 10,
  },
  lowerheader: {
    flexDirection: "column",
    justifyContent: "flex-start",
    width: SIZES.width - 20,
    marginTop: 5,
    paddingTop: SIZES.xSmall,
    paddingBottom: 20,
  },
  heading: {
    fontFamily: "bold",
    textTransform: "capitalize",
    fontSize: SIZES.small + 3,
    textAlign: "left",
    color: COLORS.themeb,
    marginStart: 20,
    marginTop: 20,
    alignSelf: "center",
  },
  statement: {
    fontFamily: "regular",
    paddingLeft: 20,
    paddingVertical: 5,
    color: COLORS.gray2,
    textAlign: "center",
  },
  list: {
    paddingHorizontal: 10,
    gap: 10,
    marginVertical: 10,
  },
  cardContent: {
    flex: 1,

    justifyContent: "space-between",
    flexDirection: "column",
    padding: 15,
  },
  image: {
    position: "absolute", // Default styles, overridden by `parsedStyle`
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.themeb,
    fontFamily: "semibold",
  },
  shippingId: {
    padding: 5,
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
    fontSize: 14,
    color: "#cccca0",
  },
  detailsWrapper: {
    width: SIZES.width - 12,
    marginHorizontal: 6,

    marginTop: SIZES.xSmall,
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
    minHeight: SIZES.height / 3,
    // alignItems: "center",
    // justifyContent: "center",
    // backgroundColor: "green",
  },
  searchBarContainer: {
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    padding: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 100,
    backgroundColor: COLORS.themew,
  },
  searchButton: {
    position: "absolute",
    right: 17,
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
  flatlist: {
    marginBottom: 190,
  },
  unreadBadge: {
    backgroundColor: "green",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  unreadText: {
    color: "white",
    fontSize: 12,
  },
  mtop: {
    marginTop: 100,
  },
});
