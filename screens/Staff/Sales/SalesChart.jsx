import React from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

const SalesChart = () => {
  const screenWidth = Dimensions.get("window").width;

  const salesData = {
    "2024-09": { actual: 3000, projected: 40000 },
    "2024-10": { actual: 2000, projected: 30000 },
    "2024-11": { actual: 200, projected: 4000 },
    "2024-12": { actual: 5000, projected: 2000 },
    "2025-01": { actual: 6000, projected: 1000 },
    "2025-02": { actual: 4000, projected: 33447 },
  };

  const labels = Object.keys(salesData).map((month) => month.slice(5));
  const actualData = Object.values(salesData).map((data) => data.actual);
  const projectedData = Object.values(salesData).map((data) => data.projected);

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(135, 206, 250, ${opacity})`, // Light blue
    labelColor: (opacity = 1) => `rgba(128, 128, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: "3 3",
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 12,
    },
  };

  const data = {
    labels: labels,
    datasets: [
      {
        data: actualData,
        color: (opacity = 1) => `rgba(135, 206, 250, ${opacity})`, // Light blue
        strokeWidth: 2,
      },
      {
        data: projectedData,
        color: (opacity = 1) => `rgba(255, 183, 77, ${opacity})`, // Gold
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={{ padding: 20, backgroundColor: "white" }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 10,
          color: "#333",
        }}
      >
        Sales Overview
      </Text>
      <LineChart
        data={data}
        width={screenWidth - 40} // Account for padding
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        fromZero={true}
        formatYLabel={(value) => `$${parseInt(value).toLocaleString()}`}
        renderDotContent={({ x, y, index }) => {
          return null; // Hide dots
        }}
      />
    </View>
  );
};

export default SalesChart;
