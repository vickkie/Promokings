import React, { useRef, useMemo, forwardRef, useCallback } from "react";
import { StyleSheet, Text, View, Modal } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { COLORS } from "../../constants";

// HomeMenu.js
const HomeMenu = React.forwardRef((props, ref) => {
  const snapPoints = useMemo(() => ["25%", "50%"], []);

  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} opacity={0.5} />,
    []
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={1}
      snapPoints={snapPoints}
      onChange={(index) => console.log("Changed", index)}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: COLORS.themeg }}
      backdropComponent={renderBackdrop}
    >
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Swipe down to close</Text>
      </View>
    </BottomSheetModal>
  );
});

export default HomeMenu;

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
