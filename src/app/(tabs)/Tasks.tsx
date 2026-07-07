import BellIcon from "@/assets/icons/bellicon";
import DueTodayIcon from "@/assets/icons/duetoday";
import FilterIcon from "@/assets/icons/filtericon";
import SevendayIcon from "@/assets/icons/sevenday";
import StatCard from "@/components/StatCard";
import TaskTable from "@/components/TaskTable";
import FilterModal from "@/components/FilterModal";
import CreateTaskModal from "@/components/CreateTaskModal";
import { Fontisto, Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const TASKS = [
  { title: "update current fund price and pdf file upload fund price", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "6, July",  status: "Completed",        project: "Website",    extraCount: undefined },
  { title: "update current fund price and pdf file upload fund price", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "3, July",  status: "Completed",        project: "Mobile App", extraCount: undefined },
  { title: "update current fund price and pdf file upload fund price", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "2, July",  status: "Completed",        project: "Backend",    extraCount: undefined },
  { title: "update current fund price and pdf file upload fund price", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "1, July",  status: "Completed",        project: "Website",    extraCount: undefined },
  { title: "Learn React Native Basics with Expo",                      createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "30, June", status: "Completed",        project: "Mobile App", extraCount: 7 },
  { title: "Setup CI/CD pipeline",                                     createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "28, June", status: "In-Progress",      project: "DevOps",     extraCount: undefined },
  { title: "API integration for payments",                             createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "25, June", status: "Pending-Approval", project: "Backend",    extraCount: undefined },
  { title: "Database schema migration",                                createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "20, June", status: "Rejected",         project: "Backend",    extraCount: undefined },
  { title: "Setup CI/CD pipeline",                                     createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "28, June", status: "In-Progress",      project: "DevOps",     extraCount: undefined },
  { title: "API integration for payments",                             createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "25, June", status: "Pending-Approval", project: "Backend",    extraCount: undefined },
  { title: "Database schema migration",                                createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "20, June", status: "Rejected",         project: "Backend",    extraCount: undefined },

];

const DUE_TODAY_TASKS = [
  { title: "Push hotfix to production",   createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "25, Apr", status: "In-Progress",      project: "Backend",    extraCount: undefined },
  { title: "Client demo preparation",     createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "25, Apr", status: "Pending-Approval", project: "Website",    extraCount: 3 },
  { title: "Review PR #42",               createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "25, Apr", status: "Pending",          project: "Mobile App", extraCount: undefined },
  { title: "Deploy staging build",        createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "25, Apr", status: "Completed",        project: "DevOps",     extraCount: undefined },
];

const TASKS_MAP: Record<string, typeof TASKS> = {
  all:        TASKS,
  today:      DUE_TODAY_TASKS,
  week:       TASKS.filter((t) => ["In-Progress", "Pending"].includes(t.status)),
  overdue:    TASKS.filter((t) => t.status === "Rejected"),
  created:    TASKS.filter((_, i) => i % 2 === 0),
  assigned:   DUE_TODAY_TASKS.filter((_, i) => i % 2 !== 0),
  recurring:  TASKS.filter((t) => t.status === "Pending-Approval"),
  completed:  TASKS.filter((t) => t.status === "Completed"),
};

const STATS = [
  { label: "All Tasks",     count: "1200", iconName: "time-outline",   id: "all"       },
  { label: "Due Today",     count: "05",   iconName: <DueTodayIcon/>,  id: "today"     },
  { label: "Due in 7 days", count: "15",   iconName: <SevendayIcon/>,  id: "week"      },
  { label: "Delayed",       count: "03",   iconName: "warning-outline",id: "overdue"   },
  { label: "Created by me", count: "12",   iconName: "person-outline", id: "created"   },
  { label: "Assigned to me",count: "05",   iconName: <DueTodayIcon/>,  id: "assigned"  },
  { label: "Recurring",     count: "15",   iconName: <SevendayIcon/>,  id: "recurring" },
  { label: "Completed",     count: "03",   iconName: "checkmark-circle-outline", id: "completed" },
];

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);

  return (
    <View style={styles.root}>
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.headerContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning, Junaid!</Text>
          <Text style={styles.subGreeting}>Let's make today productive!</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.bellWrap}>
            <Text style={styles.bell}>
              <BellIcon/>
            </Text>
            <View style={styles.bellDot} />
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
        </View>
      </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          {/* <Text style={styles.searchIcon}>🔍</Text> */}
          <Ionicons name="search-outline" size={20} color="#E6E6E6" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Task"
            placeholderTextColor="#E6E6E6"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        {/* <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterVisible(true)}>
          <Text style={styles.filterIcon}>
            <FilterIcon/>
          </Text>
        </TouchableOpacity> */}
        <Pressable
  onPress={() => setFilterVisible(true)}
  style={({ pressed }) => [
    styles.filterBtn,
    pressed && styles.filterBtnPressed,
  ]}
>
  <FilterIcon  />
</Pressable>

        <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} />
      </View>

      {/* Stat Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsScroll}
        contentContainerStyle={styles.statsContent}
      >
        {STATS.map((s) => (
          <StatCard
            key={s.id}
            label={s.label}
            count={s.count}
            iconName={s.iconName}
            active={activeTab === s.id}
            onPress={() => setActiveTab(s.id)}
          />
        ))}
      </ScrollView>

      {/* Task Table — conditional on active stat card */}
      {/* <View style={{ flex: 1, overflow: "hidden" , width: "95%"}}> */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TaskTable
          sectionTitle={STATS.find((s) => s.id === activeTab)?.label ?? "All Tasks"}
          tasks={TASKS_MAP[activeTab] ?? TASKS}
        />
      </ScrollView>
      {/* </View> */}

      {/* Bottom Tab Bar */}
      {/* <BottomTabBar active="tasks" /> */}
    </SafeAreaView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => setCreateVisible(true)}>
        <Fontisto name="plus-a" size={24} color="black" />
      </TouchableOpacity>

      <CreateTaskModal visible={createVisible} onClose={() => setCreateVisible(false)} />

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" , position: "relative"},
  safe: { flex: 1 },
  headerContainer: {
  borderBottomWidth: 1,
  borderBottomColor: "#E6E6E6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 15,
  },
  greeting: { fontSize: 18, fontFamily: "SF_Pro_Semibold", color: "#111827" },
  subGreeting: { fontSize: 12, color: "#6B7280", fontFamily: "SF_Pro_Regular", marginTop: 2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  bellWrap: { position: "relative" },
  bell: { fontSize: 22 },
  bellDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00DEAB",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#1D1D1D",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontFamily: "SF_Pro_Bold", fontSize: 14 },
  searchRow: {
    flexDirection: "row",
    paddingTop: 15,
    paddingHorizontal: 20,
    marginBottom: 14,
    gap: 10,
    alignItems: "center",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40  ,
    backgroundColor: "#fff",
  },
  searchIcon: { fontSize: 15, marginRight: 8, color: "#9CA3AF" },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 10, 
    borderWidth: 1,
    borderColor: "#E6E6E6",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6E6E6",
  },
  filterBtnPressed: {
    backgroundColor: "#0DDFAB",
  },
  filterIcon: { fontSize: 18, color: "#6B7280" },
  statsScroll: { maxHeight: 80 },
  statsContent: { paddingHorizontal: 20, paddingBottom: 6 , gap: 12},
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 },
  fab: {
    position: "absolute",
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#00DEAB",
    alignItems: "center",
    justifyContent: "center",
    // shadowColor: "#00DEAB",
    // shadowOpacity: 0.45,
    // shadowRadius: 12,
    // shadowOffset: { width: 0, height: 4 },
    // elevation: 10,
  },
  fabIcon: { fontSize: 28, color: "#fff", lineHeight: 32 },
});
