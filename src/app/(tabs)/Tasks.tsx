import DueTodayIcon from "@/assets/icons/duetoday";
import SevendayIcon from "@/assets/icons/sevenday";
import StatCard from "@/components/StatCard";
import TaskTable from "@/components/TaskTable";
import FilterModal from "@/components/FilterModal";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskDetailModal, { TaskDetail } from "@/components/TaskDetailModal";
import { Fontisto, Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppHeader from "@/components/headerapp";
import FilterIconBlack from "@/assets/icons/filtericonblack";
import AllTasksIcon from "@/assets/icons/alltask";

const TASKS = [
  { title: "update current fund price and pdf file upload fund price", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "6, July", status: "Completed", project: "Website", extraCount: undefined },
  { title: "update current fund price and pdf file upload fund price", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "3, July", status: "Completed", project: "Mobile App", extraCount: undefined },
  { title: "update current fund price and pdf file upload fund price", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "2, July", status: "Completed", project: "Backend", extraCount: undefined },
  { title: "update current fund price and pdf file upload fund price", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "1, July", status: "Completed", project: "Website", extraCount: undefined },
  { title: "Learn React Native Basics with Expo", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "30, June", status: "Completed", project: "Mobile App", extraCount: 7 },
  { title: "Setup CI/CD pipeline", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "28, June", status: "In-Progress", project: "DevOps", extraCount: undefined },
  { title: "API integration for payments", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "25, June", status: "Pending-Approval", project: "Backend", extraCount: undefined },
  { title: "Database schema migration", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "20, June", status: "Rejected", project: "Backend", extraCount: undefined },
  { title: "Setup CI/CD pipeline", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "28, June", status: "In-Progress", project: "DevOps", extraCount: undefined },
  { title: "API integration for payments", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "25, June", status: "Pending-Approval", project: "Backend", extraCount: undefined },
  { title: "Database schema migration", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "20, June", status: "Rejected", project: "Backend", extraCount: undefined },

];

const DUE_TODAY_TASKS = [
  { title: "Push hotfix to production", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "25, Apr", status: "In-Progress", project: "Backend", extraCount: undefined },
  { title: "Client demo preparation", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "25, Apr", status: "Pending-Approval", project: "Website", extraCount: 3 },
  { title: "Review PR #42", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "25, Apr", status: "Pending", project: "Mobile App", extraCount: undefined },
  { title: "Deploy staging build", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "25, Apr", status: "Completed", project: "DevOps", extraCount: undefined },
];

const TASKS_MAP: Record<string, typeof TASKS> = {
  all: TASKS,
  today: DUE_TODAY_TASKS,
  week: TASKS.filter((t) => ["In-Progress", "Pending"].includes(t.status)),
  overdue: TASKS.filter((t) => t.status === "Rejected"),
  created: TASKS.filter((_, i) => i % 2 === 0),
  assigned: DUE_TODAY_TASKS.filter((_, i) => i % 2 !== 0),
  recurring: TASKS.filter((t) => t.status === "Pending-Approval"),
  completed: TASKS.filter((t) => t.status === "Completed"),
};

const STATS = [
  { label: "All Tasks", count: "1200", iconName: <AllTasksIcon/>, id: "all" },
  { label: "Due Today", count: "05", iconName: <DueTodayIcon />, id: "today" },
  { label: "Due in 7 days", count: "15", iconName: <SevendayIcon />, id: "week" },
  { label: "Delayed", count: "03", iconName: <AllTasksIcon/>, id: "overdue" },
  { label: "Created by me", count: "12", iconName: <DueTodayIcon />, id: "created" },
  { label: "Assigned to me", count: "05", iconName: <AllTasksIcon/>, id: "assigned" },
  { label: "Recurring", count: "15", iconName: <SevendayIcon />, id: "recurring" },
  { label: "Completed", count: "03", iconName: <AllTasksIcon/>, id: "completed" },
];

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState("all");
  const [filterVisible, setFilterVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDetail | null>(null);

  const handleTaskPress = (task: typeof TASKS[0]) => {
    setSelectedTask({
      title: task.title,
      assignedTo: task.assignedTo,
      assignedToInitials: task.assignedToInitials,
      dueDate: task.dueDate,
      priority: "Urgent",
      priorityColor: "#F97316",
      approvalRequired: "Yes",
      status: task.status as any,
      recurringTask: "Weekly, 10:05 AM",
      subtasks: task.extraCount ? [
        { title: "Lorem Ipsum....", createdBy: "Junaid", dueDate: "25, April" },
      ] : [],
      dependencies: [
        { title: "Test Task 1", createdBy: "Junaid", dueDate: "25, April" },
      ],
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s.",
      attachments: ["Adobe Illustrator Final File Attached", "Adobe Illustrator"],
    });
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}

        <AppHeader
          greeting="Tasks"
          subGreeting="Assign tasks, track progress, and boost productivity."
          initials="JD"
          showSearch
          onFilterPress={() => setFilterVisible(true)}
        />
        <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} />

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
          contentContainerStyle={[styles.scrollContent]}
          showsVerticalScrollIndicator={false}
        >
          <TaskTable
            sectionTitle={STATS.find((s) => s.id === activeTab)?.label ?? "All Tasks"}
            tasks={TASKS_MAP[activeTab] ?? TASKS}
            onTaskPress={handleTaskPress}
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
      <TaskDetailModal visible={!!selectedTask} onClose={() => setSelectedTask(null)} task={selectedTask} />

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff", position: "relative" },
  safe: { flex: 1 },
  headerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#E6E6E6",
  },
  statsScroll: { maxHeight: 50 },
  statsContent: { paddingHorizontal: 20, paddingBottom: 6, gap: 6 },
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
