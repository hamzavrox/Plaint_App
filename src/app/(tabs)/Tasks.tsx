import CreateTaskModal from "@/components/CreateTaskModal";
import FilterModal from "@/components/FilterModal";
import AppHeader from "@/components/headerapp";
import StatCard from "@/components/StatCard";
import TaskDetailModal, { TaskDetail } from "@/components/TaskDetailModal";
import { StatusType, TaskRowProps } from "@/components/TaskRow";
import TaskTable from "@/components/TaskTable";
import Icons from "@/constants/icons";
import { Fontisto } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

const { AllTaskIcon: AllTasksIcon, AssignIcon, CompletedIcon, CreatedIcon, DelayIcon, DueTodayIcon, RecurringIcon, SevenDayIcon: SevendayIcon } = Icons;

const TASKS: TaskRowProps[] = [
  { id: "task-1", title: "update current fund price and pdf file upload fund price", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "6, July", status: "Completed", project: "Website" },
  { id: "task-2", title: "update current fund price and pdf file upload fund price", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "3, July", status: "Completed", project: "Mobile App" },
  { id: "task-3", title: "update current fund price and pdf file upload fund price", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "2, July", status: "Completed", project: "Backend" },
  { id: "task-4", title: "update current fund price and pdf file upload fund price", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "1, July", status: "Completed", project: "Website" },
  { id: "task-5", title: "Learn React Native Basics with Expo", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "30, June", status: "Completed", project: "Mobile App", extraCount: 7 },
  { id: "task-6", title: "Setup CI/CD pipeline", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "28, June", status: "In-Progress", project: "DevOps" },
  { id: "task-7", title: "API integration for payments", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "25, June", status: "Pending-Approval", project: "Backend" },
  { id: "task-8", title: "Database schema migration", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "20, June", status: "Rejected", project: "Backend" },
  { id: "task-9", title: "Setup CI/CD pipeline", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "28, June", status: "In-Progress", project: "DevOps" },
  { id: "task-10", title: "API integration for payments", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "25, June", status: "Pending-Approval", project: "Backend" },
  { id: "task-11", title: "Database schema migration", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "20, June", status: "Rejected", project: "Backend" },
];

const DUE_TODAY_TASKS: TaskRowProps[] = [
  { id: "today-1", title: "Push hotfix to production", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "25, Apr", status: "In-Progress", project: "Backend" },
  { id: "today-2", title: "Client demo preparation", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "25, Apr", status: "Pending-Approval", project: "Website", extraCount: 3 },
  { id: "today-3", title: "Review PR #42", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "25, Apr", status: "Pending", project: "Mobile App" },
  { id: "today-4", title: "Deploy staging build", createdBy: "Muhamm...", createdByInitials: "MZ", assignedTo: "Muhammad...", assignedToInitials: "MH", dueDate: "25, Apr", status: "Completed", project: "DevOps" },
];

// Helpers to format counts
const pad = (n: number) => String(n).padStart(2, "0");

export default function TasksScreen() {
  const [tasksState, setTasksState] = useState<TaskRowProps[]>(TASKS);
  const [dueTodayTasksState, setDueTodayTasksState] = useState<TaskRowProps[]>(DUE_TODAY_TASKS);
  const [isScrolled, setIsScrolled] = useState(false);

  const [activeTab, setActiveTab] = useState("all");
  const [filterVisible, setFilterVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDetail | null>(null);

  // Derive task lists dynamically on render based on state
  const tasksMap = useMemo<Record<string, TaskRowProps[]>>(() => {
    return {
      all: tasksState,
      today: dueTodayTasksState,
      week: tasksState.filter((t) => ["In-Progress", "Pending"].includes(t.status)),
      overdue: tasksState.filter((t) => t.status === "Rejected"),
      created: tasksState.filter((_, i) => i % 2 === 0),
      assigned: dueTodayTasksState.filter((_, i) => i % 2 !== 0),
      recurring: tasksState.filter((t) => t.status === "Pending-Approval"),
      completed: tasksState.filter((t) => t.status === "Completed"),
    };
  }, [tasksState, dueTodayTasksState]);

  // Derive stats dynamically on render so badge counts update on-the-fly
  const statsList = useMemo(() => {
    return [
      { label: "All Tasks", count: pad(tasksState.length), iconName: <AllTasksIcon />, id: "all" },
      { label: "Due Today", count: pad(dueTodayTasksState.length), iconName: <DueTodayIcon />, id: "today" },
      { label: "Due in 7 days", count: pad(tasksMap.week.length), iconName: <SevendayIcon />, id: "week" },
      { label: "Delayed", count: pad(tasksMap.overdue.length), iconName: <DelayIcon />, id: "overdue" },
      { label: "Created by me", count: pad(tasksMap.created.length), iconName: <CreatedIcon />, id: "created" },
      { label: "Assigned to me", count: pad(tasksMap.assigned.length), iconName: <AssignIcon />, id: "assigned" },
      { label: "Recurring", count: pad(tasksMap.recurring.length), iconName: <RecurringIcon />, id: "recurring" },
      { label: "Completed", count: pad(tasksMap.completed.length), iconName: <CompletedIcon />, id: "completed" },
    ];
  }, [tasksState, dueTodayTasksState, tasksMap]);

  const handleStatusChange = useCallback((targetTask: TaskRowProps, newStatus: StatusType) => {
    const updateItem = (item: TaskRowProps) => {
      if (item.id && targetTask.id) {
        return item.id === targetTask.id ? { ...item, status: newStatus } : item;
      }
      return item.title === targetTask.title ? { ...item, status: newStatus } : item;
    };

    setTasksState((prev) => prev.map(updateItem));
    setDueTodayTasksState((prev) => prev.map(updateItem));
  }, []);

  const handleTaskPress = (task: TaskRowProps) => {
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

  const statuses = [
    "Pending", "In-Progress", "On-Hold", "Rejected", "Pending-Approval", "Completed",
  ];

  const priorities = ["Low", "Medium", "High"];

  const priorityColors = {
    Low: "#0DDFD8",
    Medium: "#737373",
    High: "#DF0D0D",
  };

  const statusColors = {
    Pending: "#DFA70D",
    "In-Progress": "#607EF9",
    "On-Hold": "#0DDFAB",
    Rejected: "#FF0000",
    "Pending-Approval": "#1D1D1D",
    Completed: "#1CB333",
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}

        <AppHeader
          greeting="Tasks"
          subGreeting="Assign tasks, track progress, and boost productivity."
          initials="JD"
          placeholder="Search Tasks..."
          showSearch
          showFilter={false}
          forceSearchOpen={!isScrolled}
          onFilterPress={() => setFilterVisible(true)}
        />
        <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} statuses={statuses}
          statusColors={statusColors}
          priorities={priorities}
          priorityColors={priorityColors}
          showPriority={true} />

        {/* Stat Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroll}
          contentContainerStyle={styles.statsContent}
        >
          {statsList.map((s) => (
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

        {/* Task Table */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          onScroll={(e) => setIsScrolled(e.nativeEvent.contentOffset.y > 10)}
          scrollEventThrottle={16}
        >
          <TaskTable
            sectionTitle={statsList.find((s) => s.id === activeTab)?.label ?? "All Tasks"}
            tasks={tasksMap[activeTab] ?? tasksState}
            onTaskPress={handleTaskPress}
            onStatusChange={handleStatusChange}
            onFilterPress={() => setFilterVisible(true)}
          />
        </ScrollView>


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
  // headerContainer: {
  //   borderBottomWidth: 1,
  //   borderBottomColor: "#E6E6E6",
  // },
  statsScroll: { maxHeight: 50 },
  statsContent: { paddingHorizontal: 16, paddingBottom: 15, gap: 6 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 120 },
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
