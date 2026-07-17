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

import React, { memo, useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DynamicTable, { Column } from "./DynamicTable";
import { COL_WIDTHS, TaskRowProps, STATUS_COLORS, StatusType } from "./TaskRow";

// ─── Props (identical to the original TaskTable) ──────────────────────────────

type Props = {
  sectionTitle: string;
  tasks: TaskRowProps[];
  onTaskPress?: (task: TaskRowProps) => void;
  onStatusChange?: (task: TaskRowProps, newStatus: StatusType) => void;
};

// ─── Static column keys (order = left to right) ───────────────────────────────

const TASK_COLUMNS: Column<TaskRowProps>[] = [
  { key: "title",      title: "Task Title",  width: COL_WIDTHS.title      },
  { key: "createdBy",  title: "Created By",  width: COL_WIDTHS.createdBy  },
  { key: "assignedTo", title: "Assigned to", width: COL_WIDTHS.assignedTo },
  { key: "dueDate",    title: "Due Date",    width: COL_WIDTHS.dueDate    },
  { key: "status",     title: "Status",      width: COL_WIDTHS.status     },
  { key: "comment",    title: "Comment",     width: COL_WIDTHS.comment    },
  { key: "project",    title: "Project",     width: COL_WIDTHS.project    },
];

const ALL_STATUSES: StatusType[] = [
  "Pending", "In-Progress", "On-Hold", "Rejected", "Completed", "Pending-Approval",
];

// ─── Leading cell (accent bar + checkbox) ─────────────────────────────────────

const LeadingCell = memo(function LeadingCell({ item }: { item: TaskRowProps }) {
  const isCompleted = item.status === "Completed";
  return (
    <View style={styles.leadingCell}>
      <View style={styles.accent} />
      <View style={styles.checkboxWrap}>
        {isCompleted ? (
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        ) : (
          <View style={styles.checkbox} />
        )}
      </View>
    </View>
  );
});

// ─── TaskTable ────────────────────────────────────────────────────────────────

function TaskTable({ sectionTitle, tasks, onTaskPress, onStatusChange }: Props) {
  /**
   * Per-row status state.
   * Initialised from the tasks prop, then updated locally when the user
   * picks a new status from the dropdown.
   */
  const [rowStatuses, setRowStatuses] = useState<StatusType[]>(
    () => tasks.map((t) => t.status)
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
    [tasks, rowStatuses]
  );

  const handleRowPress = useCallback(
    (item: TaskRowProps) => onTaskPress?.(item),
    [onTaskPress]
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
    [handleRowPress]
  );

  // ── Status pill (rendered inside the tappable action cell) ──────────────────
  const renderCell = useCallback(
    (
      item: TaskRowProps,
      col: Column<TaskRowProps>,
      _rowIndex: number,
      isOpen: boolean
    ) => {
      if (col.key !== "status") return null;
      const { bg, text } = STATUS_COLORS[item.status];
      return (
        <View style={[styles.statusCell, { backgroundColor: bg }]}>
          <Text style={[styles.statusText, { color: text }]}>{item.status}</Text>
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={15}
            color={text}
          />
        </View>
      );
    },
    []
  );

  // ── Status dropdown ─────────────────────────────────────────────────────────
  const renderDropdown = useCallback(
    (item: TaskRowProps, rowIndex: number, onClose: () => void) => (
      <TaskStatusDropdown
        currentStatus={item.status}
        onSelect={(s) => {
          updateStatus(rowIndex, s);
          onStatusChange?.(item, s);
          onClose();
        }}
      />
    ),
    [updateStatus, onStatusChange]
  );

  // ── Leading cell (accent + checkbox) ───────────────────────────────────────
  const renderLeadingCell = useCallback(
    (item: TaskRowProps) => <LeadingCell item={item} />,
    []
  );

  return (
    <DynamicTable<TaskRowProps>
      sectionTitle={sectionTitle}
      columns={columns}
      data={augmentedTasks}
      renderCell={renderCell}
      renderDropdown={renderDropdown}
      actionColumnKey="status"
      leadingColumnWidth={COL_WIDTHS.spacer}
      renderLeadingCell={renderLeadingCell}
      keyExtractor={(_item, i) => String(i)}
      emptyText="No tasks found."
      collapsible={false}
      maxHeight={550} 
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
            <Text style={styles.initialsText}>{item.createdByInitials}</Text>
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
            <Text style={styles.initialsText}>{item.assignedToInitials}</Text>
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
            style={{ marginRight: 4 }}
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
            <View style={[styles.dot, { backgroundColor: STATUS_COLORS[s].text }]} />
            <Text
              style={{
                fontSize: 12,
                fontFamily: "SF_Pro_Regular",
                flex: 1,
                color: STATUS_COLORS[s].text,
              }}
            >
              {s}
            </Text>
            {isActive && (
              <Ionicons name="checkmark" size={13} color={STATUS_COLORS[s].text} />
            )}
          </TouchableOpacity>
        );
      })}
    </>
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
  accent: { width: 3, height: 40, borderRadius: 10, backgroundColor: "#CB5F00" },
  checkboxWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircle: {
    width: 16, height: 16, borderRadius: 4,
    backgroundColor: "#00DEAB", alignItems: "center", justifyContent: "center",
  },
  checkbox: {
    width: 16, height: 16, borderRadius: 4,
    borderWidth: 1.5, borderColor: "#D1D5DB", backgroundColor: "#fff",
  },

  // Title cell
  titleCell: { flexDirection: "row", alignItems: "center", paddingRight: 8 },
  titleText: { fontSize: 12, color: "#1D1D1D", flexShrink: 1, fontFamily: "SF_Pro_Medium" },
  strikethrough: { textDecorationLine: "line-through", color: "#9CA3AF" },
  extraBadge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F3F4F6", borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6,
  },
  extraText: { fontSize: 11, color: "#6B7280", marginLeft: 2 },

  // User cells
  userCell: { flexDirection: "row", alignItems: "center", paddingRight: 8 },
  initialsCreator: {
    width: 24, height: 24, borderRadius: 5,
    backgroundColor: "#00DEAB", alignItems: "center", justifyContent: "center", marginRight: 6,
  },
  initialsAssignee: {
    width: 24, height: 24, borderRadius: 5,
    backgroundColor: "#3B82F6", alignItems: "center", justifyContent: "center", marginRight: 6,
  },
  initialsText: { fontSize: 10, fontWeight: "700", color: "#fff" },

  // Shared text
  cellText: { fontSize: 12, color: "#1D1D1D", flexShrink: 1, fontFamily: "SF_Pro_Medium" },

  // Date cell
  dateCell: { flexDirection: "row", alignItems: "center", paddingRight: 8 },

  // Status pill
  statusCell: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
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
});
