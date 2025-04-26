import React, { useState, useEffect } from "react";
import { View, Text, Dimensions, Pressable } from "react-native";
import { BarChart } from "react-native-chart-kit";

const SalesChart = ({ salesinData }) => {
  const screenWidth = Dimensions.get("window").width;
  const [selectedPoint, setSelectedPoint] = useState(null);

  const dummyData = {
    "2024-11": { due: 0, paid: 0 },
    "2024-12": { due: 0, paid: 0 },
    "2025-01": { due: 0, paid: 0 },
    "2025-02": { due: 0, paid: 0 },
    "2025-03": { due: 0, paid: 0 },
    "2025-04": { due: 0, paid: 0 },
  };

  const salesData = salesinData?.paymentByMonth || dummyData;

  const monthKeys = Object.keys(salesData);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const labels = monthKeys.map((m) => monthNames[parseInt(m.slice(5), 10) - 1]);
  const dueData = monthKeys.map((k) => salesData[k].due);

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity) => `rgba(255, 69, 0, ${opacity})`,
    scrollableInfoTextStyle: { fontSize: 6 },
    labelColor: (opacity) => `rgba(128, 128, 128, ${opacity})`,
    style: { borderRadius: 16 },
    propsForBackgroundLines: { strokeDasharray: "2 3", strokeWidth: 1 },
    propsForLabels: { fontSize: 10 },
  };

  const data = {
    labels,
    datasets: [{ data: dueData }],
  };

  const chartWidth = screenWidth - 10;
  const barSpacing = 0.6;
  const barCount = labels.length;
  const barWidth = (chartWidth / barCount) * barSpacing;
  const spacing = (chartWidth - barWidth * barCount) / (barCount * 2);

  useEffect(() => {
    if (selectedPoint) {
      const t = setTimeout(() => setSelectedPoint(null), 10000);
      return () => clearTimeout(t);
    }
  }, [selectedPoint]);

  return (
    <View style={{ padding: 5, marginStart: -15, backgroundColor: "white" }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 10,
          paddingStart: 20,
          color: "#333",
        }}
      >
        Sales Overview
      </Text>

      <View>
        <BarChart
          data={data}
          width={chartWidth}
          height={220}
          fromZero
          showValuesOnTopOfBars
          barPercentage={barSpacing}
          chartConfig={chartConfig}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          segments={4}
          style={{ position: "relative", zIndex: 0 }}
        />

        {/* Invisible pressables overlay */}
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: chartWidth,
            height: 220,
            flexDirection: "row",
            justifyContent: "space-evenly",
            zIndex: 1,
          }}
        >
          {labels.map((label, index) => (
            <Pressable
              key={index}
              onPress={() =>
                setSelectedPoint({
                  month: label,
                  due: salesData[monthKeys[index]].due,
                  paid: salesData[monthKeys[index]].paid,
                })
              }
              style={{
                width: barWidth + spacing,
                height: "100%",
              }}
            />
          ))}
        </View>
      </View>

      {selectedPoint && (
        <View style={{ alignItems: "center", marginVertical: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>{`Month: ${selectedPoint.month}`}</Text>
          <Text style={{ color: "#32CD32", marginTop: 2 }}>{`Paid: ${selectedPoint.paid.toLocaleString()}`}</Text>
          <Text style={{ color: "#FF4500", marginTop: 2 }}>{`Due: ${selectedPoint.due.toLocaleString()}`}</Text>
        </View>
      )}

      <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 12, height: 12, backgroundColor: "#87CEFA", marginRight: 5 }} />
          <Text>Monthly Supply Payments</Text>
        </View>
      </View>
    </View>
  );
};

export default SalesChart;
