import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

const { width: SW, height: SH } = Dimensions.get("window");

function Avatar({
  color,
  initials,
  size = 22,
  ml = -6,
}: {
  color: string;
  initials: string;
  size?: number;
  ml?: number;
}) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          marginLeft: ml,
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>
        {initials}
      </Text>
    </View>
  );
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.statPill}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function PhoneMockup() {
  return (
    <View style={styles.phone}>
      <View style={styles.dynamicIsland} />
      <View style={styles.phoneContent}>
        <View style={styles.phoneHeader}>
          <View>
            <Text style={styles.greetingText}>Good morning, Junaid!</Text>
            <Text style={styles.greetingSubText}>
              Let's make today productive
            </Text>
          </View>
          <View style={styles.jdBadge}>
            <Text style={styles.jdText}>JD</Text>
          </View>
        </View>
        <View style={styles.searchBar}>
          <Text style={styles.searchText}>Search...</Text>
        </View>
        <View style={styles.statsRow}>
          <StatPill label="All Tasks" value="All" color="#1a1a1a" />
          <StatPill label="Due Today" value="02" color="#00DEAB" />
          <StatPill label="Due in 7 days" value="02" color="#00DEAB" />
          <StatPill label="Overdue" value="01" color="#FF6B6B" />
        </View>
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>Completed</Text>
        </View>
        <Text style={styles.allTasksLabel}>All Tasks</Text>
        <View style={styles.taskCard}>
          <View style={styles.taskAccent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.taskTitle} numberOfLines={1}>
              Create a banner design for blog
            </Text>
            <Text style={styles.taskBody} numberOfLines={1}>
              Lorem ipsum is simply dummy text of the...
            </Text>
            <View style={styles.taskMeta}>
              <Text style={styles.taskMetaLabel}>Created by</Text>
              <Text style={styles.taskMetaValue}>Junaid Manzoor</Text>
            </View>
            <Text style={styles.taskBody} numberOfLines={1}>
              Lorem ipsum is simply dummy text of the...
            </Text>
            <View style={styles.taskFooter}>
              <View style={styles.avatarGroup}>
                <Avatar color="#E8A87C" initials="A" ml={0} />
                <Avatar color="#85C1E9" initials="B" />
                <Avatar color="#82E0AA" initials="C" />
                <Avatar color="#F1948A" initials="D" />
                <View style={[styles.avatar, styles.avatarMore]}>
                  <Text style={styles.avatarMoreText}>+5</Text>
                </View>
              </View>
              <View style={styles.addProjectBtn}>
                <Text style={styles.addProjectText}>+ Add Project</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function FloatingBubbles() {
  return (
    <>
      <View style={[styles.bubble, styles.bubbleCalendar]}>
        <Text style={styles.bubbleIcon}>&#128197;</Text>
      </View>
      <View style={[styles.bubble, styles.bubbleChat]}>
        <Text style={styles.bubbleIcon}>&#128172;</Text>
        <View style={styles.bubbleBadge}>
          <Text style={styles.bubbleBadgeText}>+1</Text>
        </View>
      </View>
      <View style={[styles.bubble, styles.bubbleAvatar]}>
        <Text style={styles.bubbleIcon}>&#128100;</Text>
      </View>
    </>
  );
}

function Dots({ active = 0 }: { active?: number }) {
  return (
    <View style={styles.dotsRow}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
      ))}
    </View>
  );
}

export default function OnboardingScreen() {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.topHalf}>
        <LinearGradient
          colors={["#B8F0E6", "#D8FAF3", "#F0FEFA"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.circleHalo} />
        <FloatingBubbles />
        <PhoneMockup />
      </View>
      <View style={styles.bottomHalf}>
        <Dots active={0} />
        <Text style={styles.headline}>Work Smarter, Together</Text>
        <Text style={styles.description}>
          Plan projects, manage tasks, track progress, and collaborate with your
          team in one powerful workspace. Stay organized, meet deadlines, and
          turn ideas into results anytime, anywhere.
        </Text>
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85} onPress={()=>router.replace("/login")}>
          <LinearGradient
            colors={["#00DEAB", "#00C49A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PHONE_W = SW * 0.62;
const PHONE_H = PHONE_W * 2.05;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  topHalf: {
    flex: 1.15,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 16,
    overflow: "hidden",
  },
  circleHalo: {
    position: "absolute",
    width: SW * 0.82,
    height: SW * 0.82,
    borderRadius: SW * 0.41,
    backgroundColor: "rgba(0,222,171,0.07)",
    borderWidth: 1,
    borderColor: "rgba(0,222,171,0.13)",
    alignSelf: "center",
    top: SH * 0.03,
  },
  phone: {
    width: PHONE_W,
    height: PHONE_H,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#00DEAB",
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,
    borderWidth: 1.5,
    borderColor: "rgba(0,222,171,0.2)",
  },
  dynamicIsland: {
    alignSelf: "center",
    marginTop: 10,
    width: PHONE_W * 0.3,
    height: 10,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
  },
  phoneContent: { flex: 1, padding: 10 },
  phoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  greetingText: { fontSize: 8.5, fontWeight: "700", color: "#1a1a1a" },
  greetingSubText: { fontSize: 6, color: "#888", marginTop: 1 },
  jdBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#00DEAB",
    alignItems: "center",
    justifyContent: "center",
  },
  jdText: { fontSize: 7, fontWeight: "700", color: "#FFFFFF" },
  searchBar: {
    backgroundColor: "#F5F5F5",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginBottom: 6,
  },
  searchText: { fontSize: 6.5, color: "#AAA" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statPill: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 10, fontWeight: "700" },
  statLabel: { fontSize: 5, color: "#999", textAlign: "center" },
  completedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#00DEAB",
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 5,
  },
  completedText: { fontSize: 7, fontWeight: "700", color: "#FFFFFF" },
  allTasksLabel: { fontSize: 6.5, color: "#888", marginBottom: 4 },
  taskCard: {
    flexDirection: "row",
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    padding: 7,
    flex: 1,
  },
  taskAccent: {
    width: 2.5,
    borderRadius: 2,
    backgroundColor: "#F4A261",
    marginRight: 7,
  },
  taskTitle: {
    fontSize: 7.5,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  taskBody: { fontSize: 6, color: "#AAA", marginBottom: 3 },
  taskMeta: { marginBottom: 3 },
  taskMetaLabel: { fontSize: 5.5, color: "#00DEAB" },
  taskMetaValue: { fontSize: 6, fontWeight: "600", color: "#1a1a1a" },
  taskFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  avatarGroup: { flexDirection: "row", alignItems: "center" },
  avatar: {
    borderWidth: 1.5,
    borderColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFF", fontWeight: "700" },
  avatarMore: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E5E5E5",
    marginLeft: -6,
  },
  avatarMoreText: { fontSize: 7, color: "#555", fontWeight: "600" },
  addProjectBtn: {
    backgroundColor: "#00DEAB",
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  addProjectText: { fontSize: 6.5, color: "#FFF", fontWeight: "700" },
  bubble: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  bubbleIcon: { fontSize: 17 },
  bubbleCalendar: {
    left: SW * 0.07,
    top: SH * 0.06,
    backgroundColor: "#FFF9E6",
  },
  bubbleChat: {
    right: SW * 0.07,
    top: SH * 0.04,
    backgroundColor: "#E6FFF8",
  },
  bubbleAvatar: {
    right: SW * 0.05,
    bottom: SH * 0.05,
    backgroundColor: "#EEF6FF",
  },
  bubbleBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: "#00DEAB",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  bubbleBadgeText: { fontSize: 8, color: "#FFF", fontWeight: "700" },
  bottomHalf: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 36,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    gap: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#D9D9D9" },
  dotActive: { backgroundColor: "#00DEAB", width: 22, borderRadius: 3.5 },
  headline: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13.5,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#00DEAB",
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  ctaGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
