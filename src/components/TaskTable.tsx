import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TaskRow, { TaskRowProps, COL_WIDTHS } from "./TaskRow";

type Props = {
  sectionTitle: string;
  tasks: TaskRowProps[];
};

const COLUMNS: { label: string; width: number }[] = [
  { label: "Task Title",   width: COL_WIDTHS.title      },
  { label: "Created By",   width: COL_WIDTHS.createdBy  },
  { label: "Assigned to",  width: COL_WIDTHS.assignedTo },
  { label: "Due Date",     width: COL_WIDTHS.dueDate    },
  { label: "Status",       width: COL_WIDTHS.status     },
  { label: "Comment",      width: COL_WIDTHS.comment    },
  { label: "Project",      width: COL_WIDTHS.project    },
];

export default function TaskTable({ sectionTitle, tasks }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [openRowIndex, setOpenRowIndex] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        <TouchableOpacity
          style={styles.chevronBox}
          onPress={() => { setCollapsed((v) => !v); setOpenRowIndex(null); }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={collapsed ? "chevron-up" : "chevron-down-sharp"}
            size={20}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      </View>

      {!collapsed && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ overflow: "visible" }}>
          <View>
            <View style={styles.tableHeader}>
              <View style={{ width: COL_WIDTHS.spacer }} />
              {COLUMNS.map((col) => (
                <Text key={col.label} style={[styles.colHead, { width: col.width }]}>
                  {col.label}
                </Text>
              ))}
            </View>
            {tasks.map((task, i) => (
              <View key={i} style={{ zIndex: openRowIndex === i ? 999 : 1, elevation: openRowIndex === i ? 999 : 1 }}>
                <TaskRow
                  {...task}
                  isOpen={openRowIndex === i}
                  onOpenRequest={() => setOpenRowIndex(i)}
                  onClose={() => setOpenRowIndex(null)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: "#1F2937" },
  chevronBox: {
    width: 30, height: 30, borderRadius: 8,
    borderWidth: 1.5, borderColor: "#E5E7EB",
    alignItems: "center", justifyContent: "center",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginBottom: 2,
    alignItems: "center",
  },
  colHead: { fontSize: 12, fontWeight: "700", color: "#374151", paddingRight: 8 },
});
