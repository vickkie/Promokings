import React, { useState, useEffect } from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

const SalesChart = ({ salesinData }) => {
  const screenWidth = Dimensions.get("window").width;
  const [selectedPoint, setSelectedPoint] = useState(null);
  // console.log(salesinData);

  const dummyData = {
    "2024-09": { actual: 3000, projected: 40000 },
    "2024-10": { actual: 2000, projected: 30000 },
    "2024-11": { actual: 200, projected: 4000 },
    "2024-12": { actual: 5000, projected: 2000 },
    "2025-01": { actual: 6000, projected: 1000 },
    "2025-02": { actual: 2000, projected: 33447 },
  };
  const salesData = salesinData?.salesByMonth || dummyData;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const labels = Object.keys(salesData).map((month) => monthNames[parseInt(month.slice(5)) - 1]);
  const actualData = Object.values(salesData).map((data) => data.actual);
  const projectedData = Object.values(salesData).map((data) => data.projected);

  useEffect(() => {
    if (selectedPoint) {
      const timer = setTimeout(() => setSelectedPoint(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [selectedPoint]);

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
      fontSize: 10,
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
    <View style={{ padding: 5, marginStart: -15, backgroundColor: "white" }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, paddingStart: 20, color: "#333" }}>
        Revenue Overview
      </Text>

      <LineChart
        data={data}
        width={screenWidth + 40}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{ marginVertical: 8 }}
        fromZero
        formatYLabel={(value) => `${parseInt(value).toLocaleString()}`}
        onDataPointClick={({ value, index }) => {
          setSelectedPoint({
            month: labels[index],
            actual: actualData[index],
            projected: projectedData[index],
          });
        }}
      />

      {/* Display selected data point info */}
      {selectedPoint && (
        <View style={{ alignItems: "center", marginVertical: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>{`Month: ${selectedPoint.month}`}</Text>
          <Text style={{ color: "#87CEFA" }}>{`Actual Sales: ${selectedPoint.actual.toLocaleString()}`}</Text>
          <Text style={{ color: "#FFB74D" }}>{`Projected Sales: ${selectedPoint.projected.toLocaleString()}`}</Text>
        </View>
      )}

      {/* Legend */}
      <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginRight: 15 }}>
          <View style={{ width: 12, height: 12, backgroundColor: "#87CEFA", marginRight: 5 }} />
          <Text>Actual Sales</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 12, height: 12, backgroundColor: "#FFB74D", marginRight: 5 }} />
          <Text>Projected Sales</Text>
        </View>
      </View>
    </View>
  );
};

export default SalesChart;
