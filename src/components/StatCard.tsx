import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CARD_WIDTH = (Dimensions.get("window").width - 40 - 12 * 2) / 2.2;

type Props = {
  label: string;
  count: string | number;
  iconName?: React.ComponentProps<typeof Ionicons>["name"] | React.ReactNode;
  active?: boolean;
  onPress?: () => void;
};

export default function StatCard({
  label,
  count,
  iconName,
  active,
  onPress,
}: Props) {
  const renderIcon = () => {
    if (!iconName) return null;
    if (typeof iconName === "string") {
      return <Ionicons name={iconName as React.ComponentProps<typeof Ionicons>["name"]} size={18} color="#00DEAB" />;
    }
    return iconName as React.ReactNode;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, active && styles.activeCard]}
    >
      {iconName && (
        <View style={styles.iconBox}>
          {renderIcon()}
        </View>
      )}

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.label}>
          {label}
        </Text>

        <Text style={styles.count}>{count}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    // width: CARD_WIDTH,
    minWidth: 140,
    height: 42,
    gap:6,

    backgroundColor: "#fff",

    borderWidth: 1,
    borderColor: "#E6E6E6",

    borderRadius: 10,

    paddingHorizontal: 6,
  },

  activeCard: {
    borderColor: "#0DDFAB",
    borderWidth: 1,
  },

  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,

    backgroundColor: "#E6FFFF",
    
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flexDirection:"row",
    alignItems:"center",
    gap:4,
    // marginLeft: 8,
    flex: 1,
  },

  label: {
    fontSize: 12,
    color: "#1D1D1D",
    fontFamily: "SF_Pro_Regular",
    fontWeight: "400",
  },

  count: {
    fontSize: 14,
    fontFamily: "SF_Pro_Medium",
    // fontWeight: "700",
    color: "#1E1E1E",
    marginTop: 1,
  },
});