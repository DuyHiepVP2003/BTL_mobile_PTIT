import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ForecastDayItemProps {
  day: string;
  date: string;
  tempDay: string;
  tempNight: string;
  condition: string;
  IconComponent: React.ReactNode;
  DetailComponent?: React.ReactNode;
}

const ForecastDayItem: React.FC<ForecastDayItemProps> = ({
  day,
  date,
  tempDay,
  tempNight,
  condition,
  IconComponent,
  DetailComponent,
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dayText}>{day}</Text>
          <Text style={styles.conditionText}>{condition}</Text>
        </View>
        <View style={styles.tempRow}>
          <Text style={styles.tempText}>{tempDay}</Text>
          <Text style={styles.tempText}>{tempNight}</Text>
        </View>

        <View style={styles.iconWrapper}>{IconComponent}</View>

        <TouchableOpacity onPress={toggleExpand}>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      {expanded && <View style={styles.detailWrapper}>{DetailComponent}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#EBDCFF",
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 12,
    padding: 17,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  conditionText: {
    fontSize: 12,
    color: "#555",
  },
  tempRow: {
    alignItems: "flex-end",
    marginRight: 15,
  },
  tempText: {
    fontSize: 14,
    color: "#333",
    textAlign: "right",
  },
  iconWrapper: {
    marginHorizontal: 8,
  },
  detailWrapper: {
    marginTop: 12,
  },
});

export default ForecastDayItem;
