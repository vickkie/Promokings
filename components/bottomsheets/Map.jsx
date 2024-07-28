import React, { useRef, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Map() {
  const snapPoints = useMemo(() => ["25%", "50%", "60%"], []);
  const sheetRef = useRef(null);

  // callbacks
  const handleSheetChanges = (index) => {
    console.log("handleSheetChanges", index);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* <View style={styles.container}></View> */}

      <BottomSheetModal
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
        backdropComponent={() => <View style={styles.backdrop} />}
      >
        <View style={styles.contentContainer}>
          <Text>Swipe down to close</Text>
        </View>
      </BottomSheetModal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  bottomSheetBackground: {
    backgroundColor: "white",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
    opacity: 0.5,
  },
});
