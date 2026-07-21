/**
 * TaskTable.tsx
 *
 * Task-specific wrapper around the generic DynamicTable component.
 * Defines the task columns, leading cell (accent + checkbox), status
 * dropdown, and cell renderers — all the things are specific to tasks.
 *
 * Public API is identical to the original:
 *   <TaskTable sectionTitle="..." tasks={tasks} onTaskPress={handler} />
 *
 * Tasks.tsx requires NO changes.
 */

import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DynamicTable, { Column, SwipeStage } from "./DynamicTable";
import { COL_WIDTHS, STATUS_COLORS, StatusType, TaskRowProps } from "./TaskRow";

// ─── Props (identical to the original TaskTable) ──────────────────────────────

type Props = {
  sectionTitle: string;
  tasks: TaskRowProps[];
  onTaskPress?: (task: TaskRowProps) => void;
  onStatusChange?: (task: TaskRowProps, newStatus: StatusType) => void;
  onFilterPress?: () => void;
};

// ─── Static column keys (order = left to right) ───────────────────────────────

const VISIBLE_COL_WIDTHS = {
  title: 135,
  createdBy: 105,
  dueDate: 95,
};

const TASK_COLUMNS: Column<TaskRowProps>[] = [
  { key: "title", title: "Task Title", width: VISIBLE_COL_WIDTHS.title },
  {
    key: "createdBy",
    title: "Created By",
    width: VISIBLE_COL_WIDTHS.createdBy,
  },
  { key: "dueDate", title: "Due Date", width: VISIBLE_COL_WIDTHS.dueDate },
];

const ALL_STATUSES: StatusType[] = [
  "Pending",
  "In-Progress",
  "Rejected",
  "Completed",
  "Pending-Approval",
];

// ─── Leading cell (accent bar + checkbox) ─────────────────────────────────────

const LeadingCell = memo(function LeadingCell({
  item,
  onToggle,
}: {
  item: TaskRowProps;
  onToggle: () => void;
}) {
  const isCompleted = item.status === "Completed";
  return (
    <View style={styles.leadingCell}>
      <View style={styles.accent} />
      <TouchableOpacity
        style={styles.checkboxWrap}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        {isCompleted ? (
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        ) : (
          <View style={styles.checkbox} />
        )}
      </TouchableOpacity>
    </View>
  );
});

// ─── TaskTable ────────────────────────────────────────────────────────────────

function TaskTable({
  sectionTitle,
  tasks,
  onTaskPress,
  onStatusChange,
  onFilterPress,
}: Props) {
  /**
   * Per-row status state.
   * Initialised from the tasks prop, then updated locally when the user
   * picks a new status from the dropdown.
   */
  const [rowStatuses, setRowStatuses] = useState<StatusType[]>(() =>
    tasks.map((t) => t.status),
  );

  // Keep state in sync when tasks prop changes (e.g. switching tabs)
  const [prevTasks, setPrevTasks] = useState<TaskRowProps[]>(tasks);
  if (tasks !== prevTasks) {
    setRowStatuses(tasks.map((t) => t.status));
    setPrevTasks(tasks);
  }

  const updateStatus = useCallback((rowIndex: number, next: StatusType) => {
    setRowStatuses((prev) => {
      const copy = [...prev];
      copy[rowIndex] = next;
      return copy;
    });
  }, []);

  /**
   * Augmented tasks: merge the live rowStatuses into each item so that
   * every sub-component (LeadingCell, TaskCellContent, status pill) always
   * receives the current status — not the stale prop value.
   */
  const augmentedTasks = useMemo(
    () => tasks.map((t, i) => ({ ...t, status: rowStatuses[i] ?? t.status })),
    [tasks, rowStatuses],
  );

  const handleRowPress = useCallback(
    (item: TaskRowProps) => onTaskPress?.(item),
    [onTaskPress],
  );

  // ── Column definitions with per-column renderers ────────────────────────────
  const columns = useMemo<Column<TaskRowProps>[]>(
    () =>
      TASK_COLUMNS.map((col) => {
        if (col.key === "status") return col; // rendered by renderCell below
        return {
          ...col,
          onPress: col.key === "title" ? handleRowPress : undefined,
          render: (item: TaskRowProps) => (
            <TaskCellContent item={item} columnKey={col.key} />
          ),
        };
      }),
    [handleRowPress],
  );

  // ── Status pill (rendered inside the tappable action cell) ──────────────────
  const handleStatusSelect = useCallback(
    (item: TaskRowProps, rowIndex: number, nextStatus: StatusType) => {
      updateStatus(rowIndex, nextStatus);
      onStatusChange?.(item, nextStatus);
    },
    [updateStatus, onStatusChange],
  );

  // ── Leading cell (accent + checkbox) ───────────────────────────────────────
  const renderLeadingCell = useCallback(
    (item: TaskRowProps, rowIndex: number) => (
      <LeadingCell
        item={item}
        onToggle={() => {
          const newStatus =
            item.status === "Completed" ? "Pending" : "Completed";
          updateStatus(rowIndex, newStatus);
          onStatusChange?.(item, newStatus);
        }}
      />
    ),
    [updateStatus, onStatusChange],
  );

  return (
    <DynamicTable<TaskRowProps>
      sectionTitle={sectionTitle}
      columns={columns}
      data={augmentedTasks}
      leadingColumnWidth={COL_WIDTHS.spacer}
      renderLeadingCell={renderLeadingCell}
      renderSwipeContent={(item, rowIndex, onClose, stage, setStage) => (
        <TaskSwipeContent
          item={item}
          stage={stage}
          onClose={onClose}
          onRevealDetails={() => setStage("details")}
          onStatusSelect={(nextStatus) =>
            handleStatusSelect(item, rowIndex, nextStatus)
          }
        />
      )}
      swipeContentWidth={350}
      swipeActionWidth={176}
      keyExtractor={(_item, i) => String(i)}
      emptyText="No tasks found."
      collapsible={false}
      maxHeight={550}
      onFilterPress={onFilterPress}
      disableHorizontalScroll
    />
  );
}

export default memo(TaskTable);

// ─── TaskCellContent — renders non-status, non-leading cells ──────────────────

const TaskCellContent = memo(function TaskCellContent({
  item,
  columnKey,
}: {
  item: TaskRowProps;
  columnKey: string;
}) {
  const isCompleted = item.status === "Completed";

  switch (columnKey) {
    case "title":
      return (
        <View style={styles.titleCell}>
          <Text
            style={[styles.titleText, isCompleted && styles.strikethrough]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {item.extraCount ? (
            <View style={styles.extraBadge}>
              <Ionicons name="copy-outline" size={11} color="#6B7280" />
              <Text style={styles.extraText}>+{item.extraCount}</Text>
            </View>
          ) : null}
        </View>
      );

    case "createdBy":
      return (
        <View style={styles.userCell}>
          <View style={styles.initialsCreator}>
            <Text style={styles.initialsText}>
              {item.createdByInitials || item.createdBy?.[0] || "?"}
            </Text>
          </View>
          <Text style={styles.cellText} numberOfLines={1}>
            {item.createdBy}
          </Text>
        </View>
      );

    case "assignedTo":
      return (
        <View style={styles.userCell}>
          <View style={styles.initialsAssignee}>
            <Text style={styles.initialsText}>
              {item.assignedToInitials || item.assignedTo?.[0] || "?"}
            </Text>
          </View>
          <Text style={styles.cellText} numberOfLines={1}>
            {item.assignedTo}
          </Text>
        </View>
      );

    case "dueDate":
      return (
        <View style={styles.dateCell}>
          <Ionicons
            name="calendar-outline"
            size={15}
            color="#00DEAB"
            style={{ marginRight: 5 }}
          />
          <Text style={styles.cellText}>{item.dueDate}</Text>
        </View>
      );

    case "comment":
      return (
        <View style={styles.commentCell}>
          <Ionicons name="chatbox-outline" size={18} color="#D1D5DB" />
        </View>
      );

    case "project":
      return (
        <Text style={styles.cellText} numberOfLines={1}>
          {item.project ?? ""}
        </Text>
      );

    default:
      return null;
  }
});

// ─── Status dropdown ──────────────────────────────────────────────────────────

const TaskStatusDropdown = memo(function TaskStatusDropdown({
  currentStatus,
  onSelect,
}: {
  currentStatus: StatusType;
  onSelect: (s: StatusType) => void;
}) {
  return (
    <>
      {ALL_STATUSES.map((s) => {
        const isActive = s === currentStatus;
        return (
          <TouchableOpacity
            key={s}
            style={[styles.dropdownItem, isActive && styles.dropdownItemActive]}
            onPress={() => onSelect(s)}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: STATUS_COLORS[s]?.text ?? "#6B7280" },
              ]}
            />
            <Text
              style={{
                fontSize: 12,
                fontFamily: "SF_Pro_Regular",
                flex: 1,
                color: STATUS_COLORS[s]?.text ?? "#374151",
              }}
            >
              {s}
            </Text>
            {isActive && (
              <Ionicons
                name="checkmark"
                size={13}
                color={STATUS_COLORS[s]?.text ?? "#00DEAB"}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </>
  );
});

// ─── Swipe Content ────────────────────────────────────────────────────────────

const TaskSwipeContent = memo(function TaskSwipeContent({
  item,
  stage,
  onClose,
  onRevealDetails,
  onStatusSelect,
}: {
  item: TaskRowProps;
  stage: SwipeStage;
  onClose: () => void;
  onRevealDetails: () => void;
  onStatusSelect: (s: StatusType) => void;
}) {
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);
  const { bg, text } = STATUS_COLORS[item.status] ?? {
    bg: "#FEF3C7",
    text: "#D97706",
  };

  if (stage === "actions") {
    return (
      <View style={styles.swipePanel}>
        <View style={styles.actionStrip}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onRevealDetails}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>More</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setStatusPickerOpen((value) => !value)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>Status</Text>
          </TouchableOpacity>
        </View>

        {statusPickerOpen && (
          <View style={styles.actionDropdown}>
            <TaskStatusDropdown
              currentStatus={item.status}
              onSelect={(status) => {
                onStatusSelect(status);
                setStatusPickerOpen(false);
                onClose();
              }}
            />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.swipePanel}>
      <View style={styles.swipeHeader}>
        <Text style={[styles.swipeHeaderText, { width: 90 }]}>Assigned to</Text>
        <Text style={[styles.swipeHeaderText, { width: 75 }]}>Status</Text>
        <Text style={[styles.swipeHeaderText, { width: 75 }]}>Comment</Text>
        <Text style={[styles.swipeHeaderText, { width: 80 }]}>Project</Text>
      </View>

      <View style={styles.swipeValues}>
        <View style={[styles.swipeUserCell, { width: 90 }]}>
          <View style={styles.initialsAssignee}>
            <Text style={styles.initialsText}>
              {item.assignedToInitials || item.assignedTo?.[0] || "?"}
            </Text>
          </View>
          <Text style={styles.cellText} numberOfLines={1}>
            {item.assignedTo}
          </Text>
        </View>

        <View style={{ width: 75 }}>
          <TouchableOpacity
            style={[styles.swipeStatusCell, { backgroundColor: bg }]}
            onPress={() => setStatusPickerOpen((value) => !value)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.swipeStatusText, { color: text }]}
              numberOfLines={1}
            >
              {item.status}
            </Text>
            <Ionicons
              name={statusPickerOpen ? "chevron-up" : "chevron-down"}
              size={13}
              color={text}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.swipeCommentCell, { width: 75 }]}>
          <Ionicons name="chatbox-outline" size={16} color="#6B7280" />
          {item.extraCount ? (
            <Text style={styles.extraText}>+{item.extraCount}</Text>
          ) : null}
        </View>

        <View style={[styles.swipeProjectCell, { width: 80 }]}>
          <TouchableOpacity
            style={styles.addProjectButton}
            onPress={onClose}
            activeOpacity={0.75}
          >
            <Ionicons name="add" size={14} color="#6B7280" />
            <Text style={styles.cellText} numberOfLines={1}>
              {item.project || "Add project"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {statusPickerOpen && (
        <View style={styles.swipeDropdown}>
          <TaskStatusDropdown
            currentStatus={item.status}
            onSelect={(status) => {
              onStatusSelect(status);
              setStatusPickerOpen(false);
              onClose();
            }}
          />
        </View>
      )}
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Leading cell
  leadingCell: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
  },
  accent: {
    width: 3.5,
    height: 28,
    borderRadius: 4,
    backgroundColor: "#CB5F00",
  },
  checkboxWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircle: {
    width: 17,
    height: 17,
    borderRadius: 4,
    backgroundColor: "#00DEAB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
  },

  // Title cell
  titleCell: { flexDirection: "row", alignItems: "center", paddingRight: 8 },
  titleText: {
    fontSize: 12.5,
    color: "#1F2937",
    flexShrink: 1,
    fontFamily: "SF_Pro_Medium",
  },
  strikethrough: { textDecorationLine: "line-through", color: "#9CA3AF" },
  extraBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  extraText: { fontSize: 11, color: "#6B7280", marginLeft: 2 },

  // User cells
  userCell: { flexDirection: "row", alignItems: "center", paddingRight: 8 },
  initialsCreator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#00DEAB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  initialsAssignee: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#00DEAB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  initialsText: { fontSize: 10, fontWeight: "700", color: "#fff" },

  // Shared text
  cellText: {
    fontSize: 12.5,
    color: "#1F2937",
    flexShrink: 1,
    fontFamily: "SF_Pro_Medium",
  },

  // Date cell
  dateCell: { flexDirection: "row", alignItems: "center", paddingRight: 8 },

  // Status pill
  statusCell: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    width: COL_WIDTHS.status,
  },
  statusText: { fontSize: 11.5, fontWeight: "600" },

  // Comment cell
  commentCell: { alignItems: "flex-start", paddingLeft: 2 },

  // Dropdown items
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemActive: { backgroundColor: "#F0FDF9" },
  dot: { width: 5, height: 5, borderRadius: 4, marginRight: 5 },

  // Swipe reveal panel
  swipePanel: {
    flex: 1,
    minHeight: 52,
    backgroundColor: "transparent",
    position: "relative",
    overflow: "visible",
  },
  actionStrip: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 176,
    height: 52,
    backgroundColor: "#00DEAB",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 8,
  },
  actionButton: {
    flex: 1,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  actionText: {
    fontSize: 15,
    color: "#050505",
    fontFamily: "SF_Pro_Medium",
  },
  actionDropdown: {
    position: "absolute",
    top: 50,
    right: 6,
    width: 160,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    overflow: "hidden",
  },
  swipeHeader: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#00DEAB",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  swipeHeaderText: {
    fontSize: 14,
    color: "#050505",
    fontFamily: "SF_Pro_Medium",
  },
  swipeValues: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  swipeUserCell: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 6,
  },
  swipeStatusCell: {
    height: 34,
    borderRadius: 6,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  swipeStatusText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    marginRight: 2,
  },
  swipeCommentCell: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
  },
  swipeProjectCell: {
    justifyContent: "center",
  },
  addProjectButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  swipeDropdown: {
    position: "absolute",
    top: 52,
    left: 95,
    width: 160,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    overflow: "hidden",
  },
});
