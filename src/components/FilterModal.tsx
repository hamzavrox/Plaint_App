import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CalendarPicker from "./CalendarPicker";
import { STATUS_COLORS, StatusType } from "./TaskRow";

const STATUSES: StatusType[] = [
  "Pending", "In-Progress", "On-Hold", "Rejected", "Pending-Approval", "Completed",
];

const PRIORITIES = ["Low", "Medium", "High"];

const PRIORITY_COLORS: Record<string, string> = {
  Low:    "#00DEAB",
  Medium: "#D97706",
  High:   "#DC2626",
};

type Props = { visible: boolean; onClose: () => void };

export default function FilterModal({ visible, onClose }: Props) {
  const [selectedStatus, setSelectedStatus]     = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate]     = useState<Date | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleReset = () => {
    setSelectedStatus(null);
    setSelectedPriority(null);
    setStartDate(null);
    setEndDate(null);
    setCalendarOpen(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <Text style={styles.titleText}>Filter</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Status */}
            <Text style={styles.sectionLabel}>Status</Text>
            <View style={styles.chipsRow}>
              {STATUSES.map((s) => {
                const active = selectedStatus === s;
                const color  = STATUS_COLORS[s]?.text ?? "#6B7280";
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, active && { backgroundColor: color, borderColor: color }]}
                    onPress={() => setSelectedStatus(active ? null : s)}
                  >
                    {active
                      ? <Ionicons name="checkmark" size={13} color="#fff" style={{ marginRight: 4 }} />
                      : <View style={[styles.dot, { backgroundColor: color }]} />
                    }
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.divider} />

            {/* Priority */}
            <Text style={styles.sectionLabel}>Priority</Text>
            <View style={styles.chipsRow}>
              {PRIORITIES.map((p) => {
                const active = selectedPriority === p;
                const color  = PRIORITY_COLORS[p];
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.chip, active && { backgroundColor: color, borderColor: color }]}
                    onPress={() => setSelectedPriority(active ? null : p)}
                  >
                    {active
                      ? <Ionicons name="checkmark" size={13} color="#fff" style={{ marginRight: 4 }} />
                      : <View style={[styles.dot, { backgroundColor: color }]} />
                    }
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{p}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.divider} />

            {/* Calendar header */}
            <View style={styles.calHeaderRow}>
              <Text style={styles.calHeaderText}>Calendar</Text>
              <TouchableOpacity onPress={() => setCalendarOpen(true)}>
                <Ionicons name="calendar" size={22} color="#00DEAB" />
              </TouchableOpacity>
            </View>

            {/* Calendar Popup Modal */}
            <Modal visible={calendarOpen} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setCalendarOpen(false)}>
              <Pressable style={styles.calOverlay} onPress={() => setCalendarOpen(false)}>
                <Pressable style={styles.calPopup} onPress={() => {}}>
                  <CalendarPicker
                    startDate={startDate}
                    endDate={endDate}
                    onSelectStart={setStartDate}
                    onSelectEnd={setEndDate}
                    onDone={() => setCalendarOpen(false)}
                  />
                </Pressable>
              </Pressable>
            </Modal>
          </ScrollView>

          {/* Apply */}
          <TouchableOpacity style={styles.applyBtn} activeOpacity={0.85} onPress={onClose}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 20,
    maxHeight: "92%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  resetText: {
    fontSize: 16,
    color: "#1D1D1D",
    fontFamily: "SF_Pro_Medium",
  },
  titleText: {
    fontSize: 18,
    fontFamily: "SF_Pro_Semibold",
    color: "#1D1D1D",
  },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#1D1D1D",
    alignItems: "center", justifyContent: "center",
  },
  scrollContent: { paddingBottom: 16 },
  sectionLabel: {
    fontSize: 16,
    fontFamily: "SF_Pro_Semibold",
    color: "#1D1D1D",
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 16,
  },
  chip: {
    minWidth:50,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    backgroundColor:"#F2F2F2",
    borderColor: "#F2F2F2",
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  dot: {
    width: 5, height: 5, borderRadius: 4,
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    color: "#1D1D1D",
    fontFamily: "SF_Pro_Medium",
  },
  chipTextActive: {
    color: "#fff",
    fontFamily: "SF_Pro_Medium",
  },
  divider: {
    height: 1,
    backgroundColor: "#E6E6E6",
    marginBottom: 16,
  },
  calHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  calHeaderText: {
    fontSize: 16,
    fontFamily: "SF_Pro_Semibold",
    color: "#1D1D1D",
    textDecorationLine: "underline",
  },
  calOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  calPopup: {
    width: "100%",
    // backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  applyBtn: {
    backgroundColor: "#00DEAB",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 30,
  },
  applyText: {
    fontSize: 18,
    color: "#1D1D1D",
    fontFamily: "SF_Pro_Semibold",
  },
});
