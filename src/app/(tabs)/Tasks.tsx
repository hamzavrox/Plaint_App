import CreateTaskModal from "@/components/CreateTaskModal";
import FilterModal from "@/components/FilterModal";
import AppHeader from "@/components/headerapp";
import StatCard from "@/components/StatCard";
import TaskDetailModal, { TaskDetail } from "@/components/TaskDetailModal";
import { StatusType, TaskRowProps } from "@/components/TaskRow";
import TaskTable from "@/components/TaskTable";
import Icons from "@/constants/icons";
import { Fontisto } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { uiStatusToApi } from "@/utils/statusMapper";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

const { AllTaskIcon: AllTasksIcon, AssignIcon, CompletedIcon, CreatedIcon, DelayIcon, DueTodayIcon, RecurringIcon, SevenDayIcon: SevendayIcon } = Icons;

const pad = (n: number) => String(n).padStart(2, "0");

export default function TasksScreen() {
  const { state: authState } = useAuth();
  const {
    state: taskState,
    allMappedTasks,
    totalCount,
    fetchAllTasks,
    mappedAssignedToMe,
    mappedCreatedByMe,
    updateTaskStatusApi,
  } = useTasks();

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [filterVisible, setFilterVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDetail | null>(null);

  const companyId = authState.company?.company_id;

  useEffect(() => {
    if (companyId) {
      fetchAllTasks(companyId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const handleTabPress = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      if (companyId && tabId === "all") {
        fetchAllTasks(companyId);
      }
    },
    [companyId, fetchAllTasks]
  );

  const companyIdentifier = authState.company?.company_identifier ?? "";

  const handleStatusChange = useCallback(
    async (targetTask: TaskRowProps, newStatus: StatusType) => {
      if (!targetTask.id || !companyId) return;
      const apiStatus = uiStatusToApi(newStatus);
      try {
        await updateTaskStatusApi(Number(targetTask.id), {
          status: apiStatus,
          company_id: companyId,
          company_identifier: companyIdentifier,
        });
        fetchAllTasks(companyId);
      } catch {
        // status change failed silently
      }
    },
    [companyId, companyIdentifier, updateTaskStatusApi, fetchAllTasks]
  );

  const handleTaskPress = useCallback((task: TaskRowProps) => {
    const raw = (task as any)._raw;
    if (!raw) return;
    setSelectedTask({
      title: raw.title,
      assignedTo: task.assignedTo,
      assignedToInitials: task.assignedToInitials,
      dueDate: task.dueDate,
      priority: raw.priority_name ?? "Medium",
      priorityColor: raw.priority_color ?? "#F59E0B",
      approvalRequired: raw.approval_required ? "Yes" : "No",
      status: task.status as any,
      recurringTask: raw.is_recurring ? "Yes" : "No",
      subtasks: [],
      dependencies: [],
      description: raw.description ?? "",
      attachments: [],
      taskId: raw.id,
      companyId: companyId ?? 0,
      canEditStatus: raw.can_edit_status,
    } as any);
  }, [companyId]);

  const statuses = ["Pending", "In-Progress", "Rejected", "Pending-Approval", "Completed", "Recurring"];
  const priorities = ["Low", "Medium", "High"];
  const priorityColors: Record<string, string> = {
    Low: "#0DDFD8",
    Medium: "#737373",
    High: "#DF0D0D",
  };
  const statusColors: Record<string, string> = {
    Pending: "#DFA70D",
    "In-Progress": "#607EF9",
    Rejected: "#FF0000",
    "Pending-Approval": "#1D1D1D",
    Completed: "#1CB333",
  };

  const mapRowWithRaw = useCallback(
    (row: import("@/utils/statusMapper").MappedTaskRow): TaskRowProps & { _raw: import("@/types/task.types").TaskListItem } => ({
      id: row.id,
      title: row.title,
      createdBy: row.createdBy,
      createdByInitials: row.createdByInitials,
      assignedTo: row.assignedTo,
      assignedToInitials: row.assignedToInitials,
      dueDate: row.dueDate,
      status: row.status,
      project: row.project,
      extraCount: row.extraCount,
      _raw: row._raw,
    }),
    []
  );

  const tasksMap = useMemo<Record<string, (TaskRowProps & { _raw: import("@/types/task.types").TaskListItem })[]>>(() => {
    const all = allMappedTasks.map(mapRowWithRaw);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return {
      all,
      today: all.filter((t) => {
        if (!t._raw?.due_date) return false;
        const d = new Date(t._raw.due_date);
        return d >= todayStart && d < todayEnd;
      }),
      week: all.filter((t) => {
        if (!t._raw?.due_date) return false;
        const d = new Date(t._raw.due_date);
        return d >= todayStart && d <= weekEnd;
      }),
      overdue: all.filter((t) => {
        if (!t._raw?.due_date) return false;
        const d = new Date(t._raw.due_date);
        return d < todayStart && t.status !== "Completed";
      }),
      created: mappedCreatedByMe.map(mapRowWithRaw),
      assigned: mappedAssignedToMe.map(mapRowWithRaw),
      recurring: all.filter((t) => t._raw?.is_recurring === true),
      completed: all.filter((t) => t.status === "Completed"),
    };
  }, [allMappedTasks, mappedCreatedByMe, mappedAssignedToMe, mapRowWithRaw]);

  const displayedTasks = useMemo(() => {
    return tasksMap[activeTab] ?? tasksMap.all;
  }, [activeTab, tasksMap]);

  const statsList = useMemo(() => {
    return [
      { label: "All Tasks", count: pad(taskState.loading ? 0 : totalCount), iconName: <AllTasksIcon />, id: "all" },
      { label: "Due Today", count: pad(tasksMap.today.length), iconName: <DueTodayIcon />, id: "today" },
      { label: "Due in 7 days", count: pad(tasksMap.week.length), iconName: <SevendayIcon />, id: "week" },
      { label: "Delayed", count: pad(tasksMap.overdue.length), iconName: <DelayIcon />, id: "overdue" },
      { label: "Created by me", count: pad(tasksMap.created.length), iconName: <CreatedIcon />, id: "created" },
      { label: "Assigned to me", count: pad(tasksMap.assigned.length), iconName: <AssignIcon />, id: "assigned" },
      { label: "Recurring", count: pad(tasksMap.recurring.length), iconName: <RecurringIcon />, id: "recurring" },
      { label: "Completed", count: pad(tasksMap.completed.length), iconName: <CompletedIcon />, id: "completed" },
    ];
  }, [taskState.loading, totalCount, tasksMap]);

  if (taskState.loading && totalCount === 0) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe}>
          <AppHeader
            greeting="Tasks"
            subGreeting="Assign tasks, track progress, and boost productivity."
            placeholder="Search Tasks..."
            showSearch
            showFilter={false}
          />
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#00DEAB" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <AppHeader
          greeting="Tasks"
          subGreeting="Assign tasks, track progress, and boost productivity."
          placeholder="Search Tasks..."
          showSearch
          showFilter={false}
          forceSearchOpen={!isScrolled}
          onFilterPress={() => setFilterVisible(true)}
        />
        <FilterModal
          visible={filterVisible}
          onClose={() => setFilterVisible(false)}
          statuses={statuses}
          statusColors={statusColors}
          priorities={priorities}
          priorityColors={priorityColors}
          showPriority={true}
        />

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
              onPress={() => handleTabPress(s.id)}
            />
          ))}
        </ScrollView>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          onScroll={(e) => setIsScrolled(e.nativeEvent.contentOffset.y > 10)}
          scrollEventThrottle={16}
        >
          <TaskTable
            sectionTitle={statsList.find((s) => s.id === activeTab)?.label ?? "All Tasks"}
            tasks={displayedTasks}
            onTaskPress={handleTaskPress}
            onStatusChange={handleStatusChange}
            onFilterPress={() => setFilterVisible(true)}
          />
        </ScrollView>
      </SafeAreaView>

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
  },
  fabIcon: { fontSize: 28, color: "#fff", lineHeight: 32 },
});
