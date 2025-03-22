import React, { useMemo, useCallback, useRef, forwardRef, useContext, useState, useEffect } from "react";
import { StyleSheet, TextInput, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { COLORS, SIZES } from "../../constants";
import Icon from "../../constants/icons";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { ProfileCompletionContext } from "../auth/ProfileCompletionContext";
import { AuthContext } from "../auth/AuthContext";
import { Formik } from "formik";
import * as Yup from "yup";
import axiosRetry from "axios-retry";
import axios from "axios";

import { BACKEND_PORT } from "@env";

const CompleteProfile = forwardRef((props, ref) => {
  const snapPoints = useMemo(() => [370, 425], []);
  const navigation = useNavigation();
  const {
    completionPercentage,
    missingFields,
    message,
    isComplete,
    refreshProfileCompletion,
    syncProfileCompletionFromServer,
  } = useContext(ProfileCompletionContext);
  const { userData, userLogin, updateUserData, userLogout, hasRole } = useContext(AuthContext);
  const [showBanner, setShowBanner] = useState(true);

  const [loader, setLoader] = useState(false);

  // Create a ref for the BottomSheetModal if not provided
  const bottomSheetRef = ref || useRef(null);

  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} opacity={0.3} />,
    []
  );
  // Build initial values for the missing fields
  const initialValues = useMemo(() => {
    const init = {};
    missingFields.forEach((fieldObj) => {
      if (fieldObj.field) {
        const key = fieldObj.field.trim();
        init[key] = userData[key] || "";
      }
    });
    return init;
  }, [missingFields, userData]);

  // Build a dynamic validation schema (each missing field is required)
  const validationSchema = useMemo(() => {
    const shape = {};
    missingFields.forEach((fieldObj) => {
      if (fieldObj.field) {
        const key = fieldObj.field.trim();
        shape[key] = Yup.string().required(`${key} is required`);
      }
    });
    return Yup.object().shape(shape);
  }, [missingFields]);

  const handleSubmitForm = async (values) => {
    try {
      const formData = new FormData();

      // Append each key/value from your form values
      Object.keys(values).forEach((key) => {
        formData.append(key, values[key]);
      });

      let endpoint;

      if (userData?.position === "supplier" || userData?.role === "supplier") {
        endpoint = `${BACKEND_PORT}/api/staff/updateDetails/supplier/${userData._id}`;
      } else {
        endpoint = `${BACKEND_PORT}/api/staff/updateDetails/${userData._id}`;
      }

      const payload = {
        ...userData,
        ...values,
      };

      console.log(endpoint, payload);
      // return;

      const response = await axios.put(endpoint, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.TOKEN}`,
        },
      });

      if (response.status === 200) {
        // Merge data manually before passing it to updateUserData
        const updatedUserData = {
          ...userData, // Keep original data
          ...response.data,
          TOKEN: userData.TOKEN,
        };

        updateUserData(updatedUserData);
        syncProfileCompletionFromServer();
      }

      bottomSheetRef.current?.dismiss();
    } catch (error) {
      console.error("Error updating profile:", error);

      Toast.show({
        type: "error",
        text1: "Profile Update Failed",
        text2: "There was an error updating your profile. Please try again.",
      });
    }
  };

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
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Complete Your Profile</Text>
          <TouchableOpacity onPress={() => bottomSheetRef.current?.dismiss()} style={styles.dismissButton}>
            <Icon name="close" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.fieldsContainer}>
          <Text style={styles.subHeaderText}> Please fill in the missing fields below:</Text>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmitForm}>
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View>
                {missingFields.map((fieldObj, index) => {
                  // Check if field is defined; if not, skip rendering this field.
                  if (!fieldObj.field) return null;
                  const key = fieldObj.field.trim();
                  return (
                    <View key={index} style={styles.fieldsContainer}>
                      <Text style={styles.label}>{fieldObj.description}</Text>
                      <TextInput
                        style={[styles.inputWrapper, touched[key] && { borderColor: COLORS.secondary }]}
                        placeholder={`Enter ${key}`}
                        onChangeText={handleChange(key)}
                        onBlur={handleBlur(key)}
                        value={values[key]}
                      />
                      {touched[key] && errors[key] && <Text style={styles.errorMessage}>{errors[key]}</Text>}
                    </View>
                  );
                })}

                <TouchableOpacity onPress={handleSubmit} style={styles.completeButton}>
                  <Text style={styles.completeButtonText}>Submit Changes</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      </View>
    </BottomSheetModal>
  );
});

export default CompleteProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.medium,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontFamily: "bold",
    fontSize: SIZES.medium,
    color: COLORS.primary,
    textAlign: "center",
  },
  dismissButton: {
    padding: 0,
    position: "absolute",
    right: 10,
    top: 0,
  },
  subHeaderText: {
    marginVertical: 10,
    fontSize: 14,
    color: COLORS.gray,
  },
  fieldsContainer: {
    flex: 1,
    marginVertical: 10,
  },
  fieldItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  fieldText: {
    fontSize: 14,
    color: COLORS.black,
  },
  allCompleteText: {
    fontSize: 14,
    textAlign: "center",
    marginVertical: 20,
    color: COLORS.gray,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 17,
    paddingHorizontal: 15,
    borderRadius: SIZES.medium,
    alignItems: "center",
  },
  errorMessage: {
    color: COLORS.red,
    fontSize: 12,
    marginBottom: 10,
    marginStart: SIZES.large,
  },
  completeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: "bold",
  },
  handlebar: {
    width: SIZES.xxLarge * 2,
    backgroundColor: COLORS.themey,
  },

  label: {
    fontWeight: "bold",
    fontSize: SIZES.small,
    marginBottom: SIZES.xSmall,
    color: COLORS.themeb,

    textTransform: "capitalize",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.themew,
    padding: 10,
    borderRadius: SIZES.medium,
    marginBottom: 10,
  },
  errorMessage: {
    color: COLORS.red,
    fontSize: 12,
    marginBottom: 10,
    marginStart: SIZES.large,
  },
});
