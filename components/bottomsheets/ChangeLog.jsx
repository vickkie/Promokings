import React, { useMemo, useCallback, useRef, forwardRef, useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { COLORS, SIZES } from "../../constants";
import { useNavigation } from "@react-navigation/native";
import changelog from "../../assets/data/changelog.json";

import { ScrollView, FlatList } from "react-native-gesture-handler";

const ChangeLogMenu = forwardRef((props, ref) => {
  const snapPoints = useMemo(() => ["70%", "75%", "80%"], []);
  const navigation = useNavigation();
  const bottomSheetRef = ref || useRef(null);

  const [changelogData, setChangelogData] = useState([]);

  useEffect(() => {
    const sortedChangelog = [...changelog.changelog].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
    setChangelogData(sortedChangelog);
  }, []);

  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} opacity={0.3} />,
    []
  );

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
    bottomSheetRef.current?.dismiss();
  };

  const renderItem = ({ item }) => (
    <View style={styles.listContainer}>
      <Text style={{ fontSize: SIZES.small, marginBottom: 10 }}>{item.releaseDate}</Text>
      <Text style={styles.releaseVersion}>
        v{item.version} {item?.beta ? "Beta" : ""}
      </Text>
      {item.whatsNew.length > 0 && (
        <View>
          <Text style={styles.subheading}>What's New</Text>
          {item.whatsNew.map((newItem, index) => (
            <Text key={index} style={styles.itemText}>
              - {newItem}
            </Text>
          ))}
        </View>
      )}
      {item.fixed.length > 0 && (
        <View>
          <Text style={styles.subheading}>Fixed</Text>
          {item.fixed.map((fixedItem, index) => (
            <Text key={index} style={styles.itemText}>
              - {fixedItem}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: COLORS.themeg, borderRadius: SIZES.medium }}
      backdropComponent={renderBackdrop}
      bottomInset={20}
      containerStyle={{ borderRadius: SIZES.large, marginHorizontal: 10 }}
      handleIndicatorStyle={styles.handlebar}
      handleHeight={10}
    >
      <View style={styles.container}>
        <ScrollView>
          <FlatList
            data={changelogData}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.listWraper}
            scrollEnabled={false}
          />
        </ScrollView>
      </View>
    </BottomSheetModal>
  );
});

export default ChangeLogMenu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: SIZES.medium,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: SIZES.medium,
    color: COLORS.black,
    fontFamily: "bold",
  },
  subheading: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: SIZES.small,
    color: "blue",
  },
  itemText: {
    fontSize: 14,
    color: COLORS.black,
    marginLeft: SIZES.small,
  },
  listContainer: {
    width: SIZES.width - 55,
    borderColor: COLORS.gray,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.white,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  listWraper: {
    paddingBottom: 20,
  },
  handlebar: {
    width: SIZES.xxLarge * 2,
    backgroundColor: COLORS.themey,
  },
  releaseVersion: {
    fontSize: SIZES.xLarge,
    fontFamily: "bold",
  },
});
