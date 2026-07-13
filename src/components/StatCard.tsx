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
  style?: any;
  cardContentStyle?: any;
  labelStyle?: any;
  countStyle?: any;
};

export default function StatCard({
  label,
  count,
  iconName,
  active,
  onPress,
  style,
  cardContentStyle,
  labelStyle,
  countStyle,
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
      style={[styles.card, active && styles.activeCard, style]}
    >
      {iconName && (
        <View style={styles.iconBox}>
          {renderIcon()}
        </View>
      )}

      <View style={[styles.content, cardContentStyle]}>
        <Text numberOfLines={1} style={[styles.label, labelStyle]}>
          {label}
        </Text>

        <Text style={[styles.count, countStyle]}>{count}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    // width: CARD_WIDTH,
    // textAlign:"center",
    minWidth: 140,
    height: 42,
    gap:6,

    backgroundColor: "#fff",

    borderWidth: 1,
    borderColor: "#E6E6E6",

    borderRadius: 10,

    paddingHorizontal: 4,
  },

  activeCard: {
    borderColor: "#0DDFAB",
    borderWidth: 1,
  },

  iconBox: {
    width: 25,
    height: 25,
    borderRadius: 8,

    backgroundColor: "#E6FFFF",
    
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flexDirection:"row",
    alignItems:"center",
    // justifyContent: "center",
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