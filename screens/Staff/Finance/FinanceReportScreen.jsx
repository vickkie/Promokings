import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, Platform, ScrollView, TouchableOpacity } from "react-native";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import { WebView } from "react-native-webview";
import { shareAsync } from "expo-sharing";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../constants/icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import RNPickerSelect from "react-native-picker-select";
import { SIZES, COLORS } from "../../../constants";
import Toast from "react-native-toast-message";
import usePost2 from "../../../hook/usePost2";

const onlinelogo = "https://res.cloudinary.com/drsuclnkw/image/upload/v1741609689/Promokings/promoking-logo_h3hu4v.png";

const FinanceReportScreen = () => {
  const route = useRoute();

  const [pdfUri, setPdfUri] = useState(null);
  const [isLoading2, setIsLoading2] = useState(false);
  const [data, setData] = useState(null);
  const navigation = useNavigation();

  const [reportInput, setReportInput] = useState({
    startDate: "2025-05-01",
    endDate: "2025-06-12",
    orderType: "",
  });

  const [showPicker, setShowPicker] = useState({ show: false, type: "start" });

  const { responseData, postData, isLoading } = usePost2("v1/transactions/reports");

  useEffect(() => {
    const remappedInput = {
      dateStart: reportInput.startDate,
      dateEnd: reportInput.endDate,
      orderType: reportInput.orderType,
    };
    postData(remappedInput);
  }, [reportInput]);

  const handleDateChange = (event, selectedDate) => {
    if (event?.type === "dismissed") return setShowPicker({ show: false, type: "" });

    const formatted = selectedDate.toISOString().split("T")[0];
    setReportInput((prev) => ({
      ...prev,
      [showPicker.type === "start" ? "startDate" : "endDate"]: formatted,
    }));
    setShowPicker({ show: false, type: "" });
  };

  useEffect(() => {
    if (responseData) {
      //   console.log("📦 Got report data:", responseData);
      setData(responseData);
      generatePDF();
    }
  }, [responseData, isLoading]);

  useEffect(() => {
    // console.log(data, "now");
  }, [data]);
  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2 ? text2 : "",
      visibilityTime: 3000,
    });
  };

  const generateSalesForecastHTML = () => {
    if (!data || !data.data || !data.grandTotal) {
      console.log("me", data);
      return;
    }

    const weekData = data.data;
    const days = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];

    const formatCurrency = (num) =>
      `\$${parseFloat(num).toLocaleString(undefined, {
        minimumFractionDigits: 2,
      })}`;

    const renderWeekRow = (week) => {
      const totalsCells = days
        .map((day) => {
          const d = week.days[day] || { total: "0.00" };
          return `
          <td style="border: 1px solid #ccc; text-align: center;">${formatCurrency(d.total)}</td>
        `;
        })
        .join("");

      return `
      <tr>
        <td style="border: 1px solid #ccc; text-align: center; background-color: #f0f0f0; font-weight: bold;">${new Date(
          week.weekStartDate
        ).toLocaleDateString()}</td>
        <td style="border: 1px solid #ccc; background-color: #f8f9fa; font-weight: bold; text-align: left; padding-left: 10px;">TOTAL</td>
        ${totalsCells}
        <td style="border: 1px solid #ccc; text-align: center; background-color: #e3f2fd; font-weight: bold;">${formatCurrency(
          week.weekTotal
        )}</td>
      </tr>
    `;
    };

    const footerTotals = days
      .map(
        (day) => `
      <td style="border: 1px solid #ccc; text-align: center; background-color: #f0f0f0; font-weight: bold;">${formatCurrency(
        data.totalByDay[day]
      )}</td>
    `
      )
      .join("");

    return `
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Daily Sales Forecast</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
          color: #333;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .title {
          font-size: 20px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        .subtitle {
          font-size: 11px;
          color: #666;
          margin-bottom: 20px;
          font-style: italic;
        }
        .product-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 25px;
          gap: 20px;
        }
        .product-field, .unit-field {
          flex: 1;
        }
        .field-label {
          font-weight: bold;
          font-size: 11px;
          color: #333;
          margin-bottom: 5px;
          text-transform: uppercase;
        }
        .field-input {
          border: 1px solid #ccc;
          padding: 8px;
          background-color: white;
          min-height: 20px;
          font-size: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin-top: 10px;
        }
        th {
          background-color: #2c3e50;
          color: white;
          padding: 10px 6px;
          text-align: center;
          font-weight: bold;
          border: 1px solid #34495e;
          font-size: 10px;
          text-transform: uppercase;
        }
        td {
          padding: 6px;
          border: 1px solid #ccc;
          text-align: center;
          font-size: 10px;
        }
        .totals-header {
          background-color: #34495e;
          color: white;
          font-weight: bold;
          text-align: center;
          text-transform: uppercase;
        }
        .grand-totals {
          background-color: #f0f0f0;
          color: black;
          font-weight: bold;
        }
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 80px;
          color: rgba(0, 0, 0, 0.1);
          pointer-events: none;
          z-index: -1;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="watermark">CONFIDENTIAL</div>
        <div class="logo">
          <img src=${onlinelogo} width="81" height="69" />
        </div>
        <div class="header">Promokings Limited Kenya</div>
        <div class="section">
          <div>16727 Nairobi, Kenya</div>
          <div>+254706676569</div>
          <div>promokings@gmail.com</div>
          <div>www.promokings.co.ke</div>
        </div>
        <div class="header">
          <div class="title">PROMOKINGS FINANCE REPORT</div>
          <div class="subtitle">* Generated by finance department.</div>
        </div>

        <div class="product-section"></div>

        <table>
          <thead>
            <tr>
              <th>WEEK START DATE</th>
              <th></th>
              ${days.map((day) => `<th>${day.toUpperCase()}</th>`).join("")}
              <th>TOTALS</th>
            </tr>
          </thead>
          <tbody>
            ${weekData.map((week) => renderWeekRow(week)).join("")}
            <tr>
              <td colspan="2" class="totals-header">TOTALS BY DAY</td>
              <td colspan="7" class="totals-header"></td>
              <td class="totals-header">GRAND TOTALS</td>
            </tr>
            <tr>
              <td colspan="2" style="border: 1px solid #ccc; background-color: #f8f9fa; font-weight: bold; text-align: left; padding-left: 10px;">TOTAL</td>
              ${footerTotals}
              <td style="border: 1px solid #ccc; text-align: center;" class="grand-totals">${formatCurrency(
                data.grandTotal
              )}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </body>
  </html>
  `;
  };

  // Generate the PDF in the background
  const generatePDF = async () => {
    if (!data || !data.data || !data.grandTotal) {
      Alert.alert("Missing data", "Sales data is not available yet.");
      return;
    }

    // return;

    try {
      setIsLoading2(true);
      const { uri } = await Print.printToFileAsync({
        html: generateSalesForecastHTML(),
        base64: false,
      });
      const newUri = `${FileSystem.documentDirectory}finance_2025.pdf`;
      await FileSystem.moveAsync({ from: uri, to: newUri });
      if (Platform.OS === "android") {
        const base64Data = await FileSystem.readAsStringAsync(newUri, { encoding: FileSystem.EncodingType.Base64 });
        setPdfUri(`data:application/pdf;base64,${base64Data}`);
        console.log(base64Data);
      } else {
        setPdfUri(newUri);
      }
    } catch (error) {
      Alert.alert("Error", "Could not generate PDF");
      console.error(error);
    } finally {
      setIsLoading2(false);
    }
  };

  const pickDirectory = async () => {
    try {
      const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permission.granted) {
        return permission.directoryUri;
      } else {
        console.warn("Permission not granted for directory access.");
      }
    } catch (error) {
      console.warn("Error picking directory:", error);
    }
    return null;
  };

  const savePDF = async () => {
    if (!pdfUri) {
      Alert.alert("No PDF", "Please wait for the PDF to be generated!");
      return;
    }
    try {
      const folderUri = await pickDirectory();
      if (!folderUri) {
        Alert.alert("Cancelled", "No folder selected");
        return;
      }
      const fileName = `Reports-Promokings.pdf`;
      const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        folderUri,
        fileName,
        "application/pdf"
      );
      if (Platform.OS === "android" && pdfUri.startsWith("data:")) {
        const base64Str = pdfUri.split(",")[1];
        await FileSystem.writeAsStringAsync(newFileUri, base64Str, { encoding: FileSystem.EncodingType.Base64 });
      } else {
        await FileSystem.copyAsync({ from: pdfUri, to: newFileUri });
      }
      showToast("success", "    Saved Successfully!");
    } catch (error) {
      Alert.alert("Error", "Could not save file");
      console.error(error);
    }
  };

  const sharePDF = async () => {
    if (!pdfUri) {
      Alert.alert("No PDF", "Please wait for the PDF to be generated!");
      return;
    }
    try {
      if (Platform.OS === "android" && pdfUri.startsWith("data:")) {
        const tempFile = `${FileSystem.cacheDirectory}reports_promokings.pdf`;
        const base64Str = pdfUri.split(",")[1];
        await FileSystem.writeAsStringAsync(tempFile, base64Str, { encoding: FileSystem.EncodingType.Base64 });
        await shareAsync(tempFile);
      } else {
        await shareAsync(pdfUri);
      }
    } catch (error) {
      Alert.alert("Error", "Could not share file");
      console.error(error);
    }
  };
  const btnStyle = {
    padding: 12,
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    borderColor: "#ccc",
    borderWidth: 1,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.upperRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
              <Icon name="backbutton" size={26} />
            </TouchableOpacity>
            <Text style={styles.topheading}>Finance Report</Text>
          </View>
          <ScrollView>
            <View style={styles.lowerRow}>
              <View style={{ padding: 16, gap: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>📊 Finance Report Filter</Text>

                <TouchableOpacity onPress={() => setShowPicker({ show: true, type: "start" })} style={btnStyle}>
                  <Text>📅 Start Date: {reportInput.startDate}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowPicker({ show: true, type: "end" })} style={btnStyle}>
                  <Text>📅 End Date: {reportInput.endDate}</Text>
                </TouchableOpacity>

                {showPicker.show && (
                  <DateTimePicker
                    value={new Date(reportInput[`${showPicker.type}Date`])}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleDateChange}
                  />
                )}

                {/* Order Type Picker */}
                {/* <RNPickerSelect
                  onValueChange={(value) => setReportInput((prev) => ({ ...prev, orderType: value }))}
                  value={reportInput.orderType}
                  placeholder={{ label: "🔍 Select Order Type", value: "" }}
                  items={[
                    { label: "pickup", value: "pickup" },
                    { label: "shipping", value: "shipping" },
                  ]}
                /> */}
              </View>
              {isLoading && !data ? (
                <View style={styles.loadingContainer}>
                  <Text>Loading receipt...</Text>
                </View>
              ) : (
                <WebView
                  source={{ html: generateSalesForecastHTML() }}
                  style={styles.webview}
                  scalesPageToFit={true}
                  javaScriptEnabled={true}
                  originWhitelist={["*"]}
                  useWebKit={true}
                />
              )}
            </View>
            <View style={styles.buttonContainer}>
              <View style={styles.saveButtons}>
                <TouchableOpacity onPress={savePDF} style={styles.outWrap2}>
                  <Icon name="download" size={28} />
                </TouchableOpacity>
                <TouchableOpacity onPress={sharePDF} style={styles.outWrap2}>
                  <Icon name="share" size={28} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 10,
    borderRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  webview: {
    flex: 1,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",

    borderRadius: 4,
  },
  buttonContainer: {
    // flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginTop: 10,
    backgroundColor: COLORS.themew,
    width: SIZES.width - 20,
    borderRadius: SIZES.medium,
    paddingHorizontal: 10,
    marginStart: 10,
  },
  buttonSpacer: {
    width: 10,
  },

  wrapper: {
    flex: 1,
    backgroundColor: COLORS.themeg,
    flexDirection: "column",
  },
  upperRow: {
    width: SIZES.width - 20,
    marginHorizontal: SIZES.xSmall,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    zIndex: 999,
    minHeight: 100,
  },
  topheading: {
    fontFamily: "bold",
    fontSize: SIZES.large,

    marginTop: 10,
  },
  lowerRow: {
    marginTop: 110,
    backgroundColor: COLORS.themew,
    width: SIZES.width - 20,
    marginStart: 10,
    borderRadius: SIZES.medium,
    paddingHorizontal: 3,
    minHeight: SIZES.height - 220,
    padding: 20,
  },
  relatedRow: {
    backgroundColor: COLORS.themew,
    width: SIZES.width - 20,
    marginStart: 10,
    borderRadius: SIZES.medium,
    paddingHorizontal: 3,
    // minHeight: SIZES.height / 4,
    marginTop: 10,
    height: "auto",
  },
  paymentRow: {
    backgroundColor: COLORS.themew,
    width: SIZES.width - 20,
    marginStart: 10,
    borderRadius: SIZES.medium,
    paddingHorizontal: 3,
    minHeight: SIZES.height / 8,
    marginTop: 10,
    paddingTop: 5,
  },
  upperButtons: {
    width: SIZES.width - 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SIZES.xSmall,
    top: SIZES.xxSmall,
    height: SIZES.xxLarge,
  },
  saveButtons: {
    width: SIZES.width - 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: SIZES.xSmall,
    // top: SIZES.xxSmall,
    height: SIZES.xxLarge,
    display: "flex",
  },
  backBtn: {
    left: 10,
    position: "absolute",
    top: 3,
  },
  buttonWrap: {
    backgroundColor: COLORS.themeg,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 10,
  },
  amount: {
    fontSize: 20,
    marginBottom: 20,
    fontFamily: "semibold",
    textAlign: "center",
  },
  stepContainer: {
    width: "100%",
    marginBottom: 20,
  },
  stepContainerInner: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  nextText: {
    fontFamily: "semibold",
    textAlign: "center",
    color: COLORS.white,
    fontSize: SIZES.medium,
  },
  button1: {
    height: 40,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themey,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    height: 80,
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: SIZES.medium,
    borderColor: COLORS.themeg,
    borderWidth: 1,
  },
  image: {
    borderRadius: SIZES.medium,
    height: "96%",
    width: "96%",
  },
  rowitem: {
    flexDirection: "row",
    overflow: "hidden",
    justifyContent: "space-between",
    width: SIZES.width / 2 + 30,
  },
  title: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
  },
  semititle: {
    fontFamily: "regular",
    fontSize: SIZES.medium - 3,
  },
  details: {
    gap: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    width: SIZES.width / 2,
  },
  containerx: {
    flexDirection: "row",
    marginBottom: SIZES.small,
    backgroundColor: COLORS.themeg,
    padding: 10,
    gap: 10,
    borderRadius: SIZES.medium,
  },
  stepsheader: {
    paddingVertical: 10,
    textAlign: "left",
    justifyContent: "flex-start",
  },
  stepstext: {
    fontFamily: "regular",
    color: COLORS.gray2,
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
  outWrap2: {
    backgroundColor: COLORS.themeg,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  relatedHeader: {
    fontFamily: "bold",
    fontSize: SIZES.medium + 4,
    paddingVertical: 10,
    paddingHorizontal: 15,
    color: COLORS.gray,
  },
  driverImage: {
    width: 50,
    height: 50,
    borderRadius: 199,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff2c2",
  },
  reachIcons: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    gap: 15,
  },

  wrapperRelated: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  leftRelated: {
    flexDirection: "row",
    gap: 5,
  },
  driverHead: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
  },
  driverwho: {
    fontFamily: "regular",
    fontSize: SIZES.medium - 2,
    color: COLORS.gray2,
  },
  reachWrapper: {
    backgroundColor: COLORS.themeg,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    height: 36,
    width: 36,
  },
  inputWrapper: {
    backgroundColor: COLORS.lightWhite,
    borderWidth: 1,
    height: 45,
    borderRadius: 12,
    flexDirection: "row",
    paddingHorizontal: 15,
    alignItems: "center",
    borderColor: "#CCC",
    width: SIZES.width - 50,
    alignSelf: "center",
    marginVertical: 10,
  },
  inputWrapper2: {
    backgroundColor: COLORS.lightWhite,
    borderWidth: 1,
    height: 100,
    borderRadius: 12,
    flexDirection: "row",
    paddingHorizontal: 15,
    alignItems: "center",
    borderColor: "#CCC",
    width: SIZES.width - 50,
    alignSelf: "center",
    // marginVertical: 10,
  },
  iconStyle: {
    marginRight: 10,
  },

  selectedPayment: {
    marginHorizontal: 15,
    paddingVertical: 6,
  },
  paymentDetails: {
    marginHorizontal: 10,
    paddingVertical: 6,
    fontWeight: "700",
  },
  selectedText: {
    fontFamily: "GtAlpine",
    fontSize: SIZES.medium,
  },
  payFlex: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
    justifyContent: "space-between",
  },
  smallTop: {
    marginTop: 5,
  },
  pickerWrapper: {
    marginBottom: 10,
    marginstart: 10,
    paddingLeft: 10,
  },
  pickerLabel: {
    fontFamily: "regular",
    fontSize: SIZES.medium,
    marginBottom: 5,
    textAlign: "left",
  },

  label: {
    fontFamily: "regular",
    fontSize: SIZES.medium,
    marginBottom: 5,
    textAlign: "right",
  },
  picker: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    color: COLORS.black,
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
  },
  pickerBox: {
    borderRadius: 20,
    overflow: "hidden",
    // backgroundColor: "red",
    height: 50,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    padding: 6,
    marginVertical: 10,
    borderRadius: SIZES.medium,
    alignItems: "center",
    height: 60,
    // marginBottom: -60,
    justifyContent: "center",
  },
  deleteBtn: {
    backgroundColor: COLORS.red,
    padding: 6,
    marginVertical: 10,
    borderRadius: SIZES.medium,
    alignItems: "center",
    height: 60,
    // marginBottom: -60,
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: COLORS.gray2,
    padding: 6,
    marginVertical: 10,
    borderRadius: SIZES.medium,
    alignItems: "center",
    height: 60,
    // marginBottom: -60,
    justifyContent: "center",
  },
  completeBtn: {
    backgroundColor: COLORS.green,
    padding: 6,
    marginVertical: 10,
    borderRadius: SIZES.medium,
    alignItems: "center",
    height: 60,
    // marginBottom: -60,
    justifyContent: "center",
  },
  submitText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  actionFlex: {
    display: "flex",
    flexDirection: "row",
  },
});

export default FinanceReportScreen;
