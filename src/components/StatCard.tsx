import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
      return <Ionicons name={iconName as React.ComponentProps<typeof Ionicons>["name"]} size={24} color="#00DEAB" />;
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
    width: 162,
    height: 67,

    backgroundColor: "#fff",

    borderWidth: 1,
    borderColor: "#E6E6E6",

    borderRadius: 10,

    paddingHorizontal: 8,
  },

  activeCard: {
    borderColor: "#0DDFAB",
    borderWidth: 1,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,

    backgroundColor: "#E6FFFF",
    
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    marginLeft: 12,
    flex: 1,
  },

  label: {
    fontSize: 12,
    color: "#1D1D1D",
    fontFamily: "SF_Pro_Regular",
    fontWeight: "400",
  },

  count: {
    fontSize: 20,
    fontFamily: "SF_Pro_Medium",
    // fontWeight: "700",
    color: "#1E1E1E",
    marginTop: 1,
  },
});