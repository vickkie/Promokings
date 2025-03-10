import React, { useState, useEffect } from "react";
import { View, Button, Alert, Text, StyleSheet, Platform } from "react-native";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { WebView } from "react-native-webview";
import { shareAsync } from "expo-sharing";
import { useRoute } from "@react-navigation/native";

const InvoiceScreen = () => {
  const route = useRoute();
  const { order } = route.params;
  const [pdfUri, setPdfUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateHTMLInvoice = () => {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { font-size: 20px; font-weight: bold; margin-bottom: 10px; text-align: center; }
            .logo { text-align: center; margin-bottom: 10px; }
            .section { margin-top: 15px; }
            .row { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
            .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <div class="logo">
            <img src="https://res.cloudinary.com/drsuclnkw/image/upload/v1741609689/Promokings/promoking-logo_h3hu4v.png" width="81" height="69" />
          </div>
          <div class="header">Promokings Limited Kenya</div>
          <div>16727 Nairobi, Kenya</div>
          <div>+254706676569</div>
          <div class="section">
            <div class="bold">BILL TO:</div>
            <div>${order?.userId?.fullname || order?.userId?.username},</div>
            <div>${order?.shippingInfo?.address}, ${order?.shippingInfo?.city}</div>
            <div>${order?.shippingInfo?.phoneNumber}</div>
          </div>
          <div class="section">
            <div class="bold">INVOICE</div>
            <div>Invoice Number: ${order?.orderId}</div>
            <div>Order Date: ${new Date(order?.createdAt).toLocaleString()}</div>
          </div>
          <table class="table">
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
            ${order?.products
              ?.map(
                (product) => `
                  <tr>
                    <td>${product?._id?.title}</td>
                    <td>KSh ${product?._id?.price}</td>
                    <td>${product?.quantity}</td>
                    <td>KSh ${product?.quantity * product?._id?.price}</td>
                  </tr>
                `
              )
              .join("")}
          </table>
          <div class="section">
            <div class="row"><span>Total:</span> <span>KSh ${order?.totalAmount}</span></div>
            <div class="row"><span>Delivery:</span> <span>KSh ${order?.deliveryAmount}</span></div>
            <div class="row"><span>Sub Total:</span> <span class="bold">KSh ${order?.subtotal}</span></div>
          </div>
          <div class="section">
            <div class="bold">Manager: Kamau Victor Mwangi</div>
          </div>
          <div class="section">Thank you for doing business with us!</div>
        </body>
      </html>
    `;
  };

  // Generate PDF in the background for saving and sharing
  const generatePDF = async () => {
    try {
      setIsLoading(true);
      const { uri } = await Print.printToFileAsync({
        html: generateHTMLInvoice(),
        base64: false,
      });
      const newUri = `${FileSystem.documentDirectory}invoice_${order?.orderId}.pdf`;
      await FileSystem.moveAsync({ from: uri, to: newUri });
      if (Platform.OS === "android") {
        const base64Data = await FileSystem.readAsStringAsync(newUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
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
        const folderUri = await FileSystem.StorageAccessFramework.browseForFolderAsync();
        console.log("Selected folder URI:", folderUri);
        return folderUri;
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
      // Pick a directory
      const folderUri = await pickDirectory();
      if (!folderUri) {
        Alert.alert("Cancelled", "No folder selected");
        return;
      }
      console.log("Folder URI to save file:", folderUri);

      const fileName = `saved_${order?.orderId}.pdf`;
      // Create a file in the selected folder
      const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        folderUri,
        fileName,
        "application/pdf"
      );
      console.log("New file URI:", newFileUri);

      // Write data to the file
      if (Platform.OS === "android" && pdfUri.startsWith("data:")) {
        const base64Str = pdfUri.split(",")[1];
        await FileSystem.writeAsStringAsync(newFileUri, base64Str, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else {
        await FileSystem.copyAsync({ from: pdfUri, to: newFileUri });
      }
      Alert.alert("Saved!", `Invoice saved at: ${newFileUri}`);
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
        const tempFile = `${FileSystem.cacheDirectory}temp_invoice_${order?.orderId}.pdf`;
        const base64Str = pdfUri.split(",")[1];
        await FileSystem.writeAsStringAsync(tempFile, base64Str, {
          encoding: FileSystem.EncodingType.Base64,
        });
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
    if (order) {
      generatePDF();
    }
  }, [order]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading invoice...</Text>
        </View>
      ) : (
        // Render the invoice as HTML in the WebView for display
        <WebView
          source={{ html: generateHTMLInvoice() }}
          style={styles.webview}
          scalesPageToFit={true}
          javaScriptEnabled={true}
          originWhitelist={["*"]}
          useWebKit={true}
        />
      )}
      <View style={styles.buttonContainer}>
        <Button title="Save PDF" onPress={savePDF} />
        <View style={styles.buttonSpacer} />
        <Button title="Share PDF" onPress={sharePDF} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  buttonSpacer: {
    width: 10,
  },
});

export default InvoiceScreen;
