import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, Platform, ScrollView, TouchableOpacity } from "react-native";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import { WebView } from "react-native-webview";
import { shareAsync } from "expo-sharing";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../constants/icons"; // adjust import if needed
import { SIZES, COLORS } from "../../../constants"; // adjust if needed

const SupplyReceiptScreen = () => {
  const route = useRoute();
  const { transaction } = route.params; // expect transaction data to be passed via route
  const [pdfUri, setPdfUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  if (!transaction) {
    navigation.goBack();
    return null;
  }

  const currentSupply = transaction.inventoryRequest.bids.find(
    (bid) => bid.supplier.toString() === transaction.inventoryRequest.selectedSupplier.toString()
  );

  console.log("Transaction:", transaction);

  // Function to generate the HTML receipt using transaction data
  const generateHTMLInvoice = (showWatermark = true) => {
    return `
<html>
  <head>
    <style>
      body { 
        font-family: Arial, sans-serif; 
        padding: 20px; 
        position: relative;
        ${!showWatermark ? "" : ""}
      }
      ${
        showWatermark
          ? `.watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-30deg);
        font-size: 80px;
        color: rgba(0, 0, 0, 0.1);
        pointer-events: none;
        z-index: -1;
      }`
          : ""
      }
      .header { 
        font-size: 20px; 
        font-weight: bold; 
        margin-bottom: 10px; 
        text-align: center; 
      }
      .logo { 
        text-align: center; 
        margin-bottom: 10px; 
      }
      .section { 
        margin-top: 15px; 
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .footer{
        margin-top: 20px; 
        display: flex; 
        justify-content: center; 
        align-items: flex-end;
      }
      .row { 
        display: flex; 
        justify-content: space-between; 
      }
      .bold { 
        font-weight: bold; 
      }
      .table { 
        width: 100%; 
        border-collapse: collapse; 
        margin-top: 15px; 
      }
      .table th, .table td { 
        border: 1px solid #ddd; 
        padding: 8px; 
        text-align: left; 
      }
      .spaceB2in { 
        margin-bottom: 20px; 
      }
      .totalPrices { 
        display: flex; 
        justify-content: flex-end; 
      }
      .paddingTop { 
        padding-top: 10px; 
      }
    </style>
  </head>
  <body>
    ${showWatermark ? `<div class="watermark">CONFIDENTIAL</div>` : ""}
    <div class="logo">
      <img src="https://res.cloudinary.com/drsuclnkw/image/upload/v1741609689/Promokings/promoking-logo_h3hu4v.png" width="81" height="69" />
    </div>
    <div class="header">Promokings Limited Kenya</div>
    <div class="section">
      <div>16727 Nairobi, Kenya</div>
      <div>+254706676569</div>
      <div>promokings@gmail.com</div>
      <div>www.promokings.co.ke</div>
    </div>

    <!-- Supplier Info repurposed for BILL TO -->
    <div class="section">
      <div class="bold">BILL TO:</div>
      <div>${transaction.supplier.name}</div>
      <div>${transaction.supplier.address}</div>
      <div>${transaction.supplier.email}</div>
      <div>${transaction.supplier.phoneNumber}</div>
    </div>

    <!-- Transaction Info Section -->
    <div class="section">
      <div class="bold">RECEIPT</div>
      <div>Receipt Number: ${transaction.TransactionId}</div>
      <div>Transaction Date: ${new Date(transaction.createdAt).toLocaleString()}</div>
      <div>Payment Method: ${transaction.method}</div>
    </div>

    <!-- Inventory Request / Product Table -->
    <table class="table">
      <tr>
        <th>Item</th>
        <th>Price</th>
        <th>Qty</th>
        <th>Total</th>
      </tr>
      <tr>
        <td>${transaction.inventoryRequest.productName}</td>
        <td>KSh ${currentSupply.bidPrice}</td>
        <td>${transaction.inventoryRequest.quantity}</td>
        <td>KSh ${currentSupply?.bidPrice * transaction.inventoryRequest.quantity}</td>
      </tr>
    </table>

    <!-- Totals Section -->
    <div class="section totalPrices">
      <div class="row spaceB2in">
        <div>Sale total:</div> 
        <div>KSh ${transaction.amount}.00</div>
      </div>
      <div class="row spaceB2in">
        <div>Additional Fees:</div>
        <div>KSh ${transaction.additionalFees || `0.00`}</div>
      </div>
 
      <div class="row spaceB2in">
        <div>Sub Total:</div> 
        <div class="bold">KSh ${transaction.amount + transaction?.additionalFees}.00</div>
      </div>
    </div>
    <div class="section">
      <div class="bold">Manager: Kamau Victor</div>
      <div class="bold paddingTop">Signature</div>
    </div>
    <div class="footer">
      <div class="footerthanks">Thank you for doing business with us!</div>
    </div>
  </body>
</html>
`;
  };

  // Generate the PDF in the background
  const generatePDF = async () => {
    try {
      setIsLoading(true);
      const { uri } = await Print.printToFileAsync({
        html: generateHTMLInvoice(),
        base64: false,
      });
      const newUri = `${FileSystem.documentDirectory}receipt_${transaction.TransactionId}.pdf`;
      await FileSystem.moveAsync({ from: uri, to: newUri });
      if (Platform.OS === "android") {
        const base64Data = await FileSystem.readAsStringAsync(newUri, { encoding: FileSystem.EncodingType.Base64 });
        setPdfUri(`data:application/pdf;base64,${base64Data}`);
      } else {
        setPdfUri(newUri);
      }
    } catch (error) {
      Alert.alert("Error", "Could not generate PDF");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const pickDirectory = async () => {
    try {
      const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permission.granted) {
        return permission.directoryUri;
      } else {
        console.log("Permission not granted for directory access.");
      }
    } catch (error) {
      console.log("Error picking directory:", error);
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
      const fileName = `Billing_${transaction.TransactionId}.pdf`;
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
      Alert.alert("Saved!", `Receipt saved at: ${newFileUri}`);
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
        const tempFile = `${FileSystem.cacheDirectory}receipt_${transaction.TransactionId}.pdf`;
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

  useEffect(() => {
    if (transaction) {
      generatePDF();
    }
  }, [transaction]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.upperRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
              <Icon name="backbutton" size={26} />
            </TouchableOpacity>
            <Text style={styles.topheading}>Receipt</Text>
          </View>
          <ScrollView>
            <View style={styles.lowerRow}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text>Loading receipt...</Text>
                </View>
              ) : (
                <WebView
                  source={{ html: generateHTMLInvoice() }}
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
    minHeight: SIZES.height - 250,
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

export default SupplyReceiptScreen;
