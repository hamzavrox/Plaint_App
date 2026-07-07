import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CalendarPicker from "./CalendarPicker";
import { STATUS_COLORS, StatusType } from "./TaskRow";

const STATUSES: StatusType[] = [
  "Pending", "In-Progress", "On-Hold", "Pending-Approval", "Rejected", "Completed",
];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

type Props = { visible: boolean; onClose: () => void };

function formatDate(d: Date) {
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}, ${d.getFullYear()}`;
}

export default function FilterModal({ visible, onClose }: Props) {
  const [statusOpen, setStatusOpen]         = useState(false);
  const [priorityOpen, setPriorityOpen]     = useState(false);
  const [selectedStatus, setSelectedStatus]     = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [startDate, setStartDate]       = useState<Date | null>(null);
  const [endDate, setEndDate]           = useState<Date | null>(null);

  const handleClose = () => {
    setStatusOpen(false);
    setPriorityOpen(false);
    setCalendarOpen(false);
    onClose();
  };

  const dateLabel = () => {
    if (startDate && endDate) return `${formatDate(startDate)}  →  ${formatDate(endDate)}`;
    if (startDate) return `${formatDate(startDate)}  →  End Date`;
    return null;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.centeredView} pointerEvents="box-none">
            <View style={styles.card}>

              {/* Close */}
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.titleRow}>
                <View style={styles.titleIcon}>
                  <Ionicons name="options-outline" size={20} color="#1D1D1D" />
                </View>
                <Text style={styles.titleText}>Customize Your View</Text>
              </View>

              {/* Status + Priority */}
              <View style={styles.row}>
                {/* Status */}
                <View style={[styles.dropdownWrap, statusOpen && { zIndex: 20 }]}>
                  <TouchableOpacity
                    style={[styles.select, (statusOpen || selectedStatus) && styles.selectActive]}
                    activeOpacity={0.8}
                    onPress={() => { setStatusOpen(!statusOpen); setPriorityOpen(false); setCalendarOpen(false); }}
                  >
                    {selectedStatus && <Text style={styles.floatLabel}>Status</Text>}
                    <Text style={[selectedStatus ? styles.selectValue : styles.selectPlaceholder, statusOpen && { color: "#1D1D1D" }]}>
                      {selectedStatus ?? "Status"}
                    </Text>
                    <Ionicons name={statusOpen ? "chevron-up" : "chevron-down"} size={18} color={statusOpen || selectedStatus ? "#1D1D1D" : "#E6E6E6"} />
                  </TouchableOpacity>
                  {statusOpen && (
                    <View style={styles.dropdown}>
                      {STATUSES.map((item) => (
                        <TouchableOpacity
                          key={item}
                          style={[styles.dropItem, selectedStatus === item && styles.dropItemActive]}
                          onPress={() => { setSelectedStatus(item); setStatusOpen(false); }}
                        >
                          <View style={[styles.dot, { backgroundColor: STATUS_COLORS[item].text }]} />
                          <Text style={[styles.dropItemText, { color: STATUS_COLORS[item].text }]}>{item}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Priority */}
                <View style={[styles.dropdownWrap, priorityOpen && { zIndex: 20 }]}>
                  <TouchableOpacity
                    style={[styles.select, (priorityOpen || selectedPriority) && styles.selectActive]}
                    activeOpacity={0.8}
                    onPress={() => { setPriorityOpen(!priorityOpen); setStatusOpen(false); setCalendarOpen(false); }}
                  >
                    {selectedPriority && <Text style={styles.floatLabel}>Priority</Text>}
                    <Text style={[selectedPriority ? styles.selectValue : styles.selectPlaceholder, priorityOpen && { color: "#1D1D1D" }]}>
                      {selectedPriority ?? "Priority"}
                    </Text>
                    <Ionicons name={priorityOpen ? "chevron-up" : "chevron-down"} size={18} color={priorityOpen || selectedPriority ? "#1D1D1D" : "#E6E6E6"} />
                  </TouchableOpacity>
                  {priorityOpen && (
                    <View style={styles.dropdown}>
                      {PRIORITIES.map((item) => (
                        <TouchableOpacity
                          key={item}
                          style={[styles.dropItem, selectedPriority === item && styles.dropItemActive]}
                          onPress={() => { setSelectedPriority(item); setPriorityOpen(false); }}
                        >
                          <View style={[styles.dot, { backgroundColor: "#6B7280" }]} />
                          <Text style={styles.dropItemText}>{item}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Date row */}
              <TouchableOpacity
                style={[
  styles.dateRow,
  (calendarOpen || startDate || endDate) && styles.selectActive,
]}
                onPress={() => { setCalendarOpen(!calendarOpen); setStatusOpen(false); setPriorityOpen(false); }}
                activeOpacity={0.8}
              >
                {dateLabel() ? (
                  <Text style={styles.dateValue}>{dateLabel()}</Text>
                ) : (
                  <>
                    <Text style={styles.datePlaceholder}>Start Date</Text>
                    <Ionicons name="arrow-forward" size={16} color="#E6E6E6" style={{ marginHorizontal: 8 }} />
                    <Text style={styles.datePlaceholder}>End Date</Text>
                  </>
                )}
                <View style={[
  styles.calendarBtn,
  (calendarOpen || startDate || endDate) && {
    backgroundColor: "#1D1D1D",
  },
]}>
                  <Ionicons
  name="calendar-outline"
  size={18}
  color={
    calendarOpen || startDate || endDate
      ? "#FFFFFF"
      : "#9CA3AF"
  }
/>
                </View>
              </TouchableOpacity>

              {/* Reusable Calendar */}
              {calendarOpen && (
                <CalendarPicker
                  startDate={startDate}
                  endDate={endDate}
                  onSelectStart={setStartDate}
                  onSelectEnd={setEndDate}
                  onDone={() => setCalendarOpen(false)}
                />
              )}

            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" },
  backdrop: { ...StyleSheet.absoluteFillObject },
  centeredView: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  card: {
    backgroundColor: "#FFFFFF",  
    borderRadius: 22,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  closeBtn: {
    alignSelf: "flex-end",
    width: 30, height: 30, borderRadius: 18,
    backgroundColor: "#1D1D1D",
    justifyContent: "center", alignItems: "center",
  },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  titleIcon: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: "#00DEAB",
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  titleText: { fontSize: 16, fontFamily: "SF_Pro_Semibold", color: "#1D1D1D" },
  row: { flexDirection: "row", marginBottom: 14 },
  dropdownWrap: { flex: 1, marginHorizontal: 5 },
  select: {
    height: 40, minWidth: 140, borderWidth: 1, borderColor: "#E6E6E6",
    borderRadius: 8, flexDirection: "row", alignItems: "center",
    paddingHorizontal: 12, backgroundColor: "#fff",
  },
  selectActive: { borderColor: "#1D1D1D"  },
  floatLabel: {
    position: "absolute", top: -9, left: 10, fontSize: 11,
    backgroundColor: "#fff", color: "#1D1D1D", paddingHorizontal: 4, fontFamily: "SF_Pro_Regular",
  },
  selectPlaceholder: { flex: 1, color: "#E6E6E6", fontSize: 14 ,  fontFamily: "SF_Pro_Regular", },
  selectValue: { flex: 1, color: "#1D1D1D", fontSize: 14, fontFamily: "SF_Pro_Regular",},
  dropdown: {
    position: "absolute", top: 52, left: 0, right: 0,
    backgroundColor: "#fff", borderRadius: 10, borderWidth: 1,
    borderColor: "#E6E6E6", overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  dropItem: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
    
    
  },
  dropItemActive: { backgroundColor: "#F0FDF9"  },
  dot: { width: 5, height: 5, borderRadius: 4, marginRight: 5 },
  dropItemText: { fontSize: 12, color: "#1D1D1D" , fontFamily: "SF_Pro_Regular", },
  dateRow: {
    height: 40, borderRadius: 8, borderWidth: 1, borderColor: "#E6E6E6",
    flexDirection: "row", alignItems: "center", paddingHorizontal: 8,
  },
  datePlaceholder: { flex: 1, color: "#E6E6E6", fontSize: 14, fontFamily: "SF_Pro_Regular" },
  dateValue: { flex: 1, color: "#1D1D1D", fontSize: 12, fontFamily: "SF_Pro_Regular", },
  calendarBtn: { padding: 4, backgroundColor: "#E6E6E6", borderRadius: 6  },
});
