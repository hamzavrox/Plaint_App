/**
 * DynamicTable.tsx
 *
 * A fully reusable, generic table component for React Native.
 * Accepts any dataset via `columns` + `data` props and delegates
 * all cell rendering to the caller via `renderCell` or column-level `render`.
 *
 * Usage on any screen:
 *
 *   <DynamicTable
 *     columns={columns}
 *     data={myData}
 *     renderCell={(item, col, rowIndex, isOpen) => <MyCell ... />}
 *     onRowPress={(item) => openDetail(item)}
 *   />
 *
 * Design tokens are preserved identically from the original TaskTable/TaskRow.
 */

import React, {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ─── Column definition ────────────────────────────────────────────────────────

export interface Column<T = any> {
  /** Unique key that maps to a field in the data item (used as React key) */
  key: string;
  /** Header label displayed in the table header row */
  title: string;
  /** Fixed pixel width of this column */
  width?: number;
  /** Text alignment of header label — defaults to "left" */
  align?: "left" | "center" | "right";
  /**
   * Optional per-column static renderer.
   * If omitted the parent's `renderCell` prop is used instead.
   */
  render?: (item: T, rowIndex: number) => ReactNode;
  /** Optional callback when a cell in this column is pressed */
  onPress?: (item: T, rowIndex: number) => void;
}

// ─── DynamicTable props ───────────────────────────────────────────────────────

export interface DynamicTableProps<T = any> {
  /** Section heading displayed above the table */
  sectionTitle?: string;
  /** Column definitions (order matters — rendered left to right) */
  columns: Column<T>[];
  /** Dataset to render — one row per item */
  data: T[];

  // ── Cell rendering ──────────────────────────────────────────────────────────
  /**
   * Global cell renderer called for every cell that does not have a column-level
   * `render` function.  Receives the data item, the column, the row index, and
   * whether this row's action dropdown is currently open.
   */
  renderCell?: (
    item: T,
    column: Column<T>,
    rowIndex: number,
    isOpen: boolean
  ) => ReactNode;

  /**
   * Optional renderer for the row-level action dropdown.
   * Called once per row when `actionColumnKey` is supplied.
   * Must return the full list of dropdown option nodes.
   */
  renderDropdown?: (item: T, rowIndex: number, onClose: () => void) => ReactNode;

  /**
   * The column `key` whose cell acts as the toggle for the dropdown.
   * Tapping that cell opens/closes the per-row dropdown.
   */
  actionColumnKey?: string;

  // ── Optional leading column ─────────────────────────────────────────────────
  /**
   * Width of an optional fixed leading spacer column (e.g. accent + checkbox).
   * Pass `0` or omit to skip.
   */
  leadingColumnWidth?: number;

  /**
   * Renderer for the leading column content for each row.
   * Receives the item and whether the row is "checked".
   */
  renderLeadingCell?: (item: T, rowIndex: number) => ReactNode;

  // ── Row interaction ─────────────────────────────────────────────────────────
  /** Called when the user taps anywhere on a row (excluding the action cell) */
  onRowPress?: (item: T, rowIndex: number) => void;

  // ── State handling ──────────────────────────────────────────────────────────
  /** Show a centered loading spinner instead of rows */
  loading?: boolean;
  /** Message shown when data is empty and loading is false */
  emptyText?: string;
  /**
   * Custom key extractor — defaults to row index converted to string.
   * Provide stable unique keys for better performance.
   */
  keyExtractor?: (item: T, index: number) => string;

  // ── Row z-index ─────────────────────────────────────────────────────────────
  /** Row z-index when NOT the open row — defaults to 1 */
  rowZIndex?: number;
  /** Row z-index when it IS the open row — defaults to 9999 */
  openRowZIndex?: number;
  /** Whether the table is collapsible — defaults to true */
  collapsible?: boolean;
  /** Max height of the scrollable rows area — defaults to 300 */
  maxHeight?: number;
}

// ─── DynamicRow (memoised) ────────────────────────────────────────────────────

interface DynamicRowProps<T> {
  item: T;
  rowIndex: number;
  columns: Column<T>[];
  renderCell?: DynamicTableProps<T>["renderCell"];
  renderDropdown?: DynamicTableProps<T>["renderDropdown"];
  actionColumnKey?: string;
  leadingColumnWidth?: number;
  renderLeadingCell?: (item: T, rowIndex: number) => ReactNode;
  onRowPress?: (item: T, rowIndex: number) => void;
  isOpen: boolean;
  onOpenRequest: () => void;
  onClose: () => void;
  rowZIndex: number;
  openRowZIndex: number;
}

const DynamicRow = memo(function DynamicRow<T>({
  item,
  rowIndex,
  columns,
  renderCell,
  renderDropdown,
  actionColumnKey,
  leadingColumnWidth,
  renderLeadingCell,
  onRowPress,
  isOpen,
  onOpenRequest,
  onClose,
  rowZIndex,
  openRowZIndex,
}: DynamicRowProps<T>) {
  const zIndex = isOpen ? openRowZIndex : rowZIndex;

  // Calculate left offset of the action column for dropdown positioning
  const actionLeft = useMemo(() => {
    if (!actionColumnKey) return 0;
    let offset = leadingColumnWidth ?? 0;
    for (const col of columns) {
      if (col.key === actionColumnKey) break;
      offset += col.width ?? 0;
    }
    return offset;
  }, [actionColumnKey, columns, leadingColumnWidth]);

  const actionColWidth = useMemo(() => {
    if (!actionColumnKey) return 0;
    return columns.find((c) => c.key === actionColumnKey)?.width ?? 0;
  }, [actionColumnKey, columns]);

  const handleRowPress = useCallback(() => {
    onRowPress?.(item, rowIndex);
  }, [onRowPress, item, rowIndex]);

  const resolveCell = useCallback(
    (col: Column<T>): ReactNode => {
      if (col.render) return col.render(item, rowIndex);
      if (renderCell) return renderCell(item, col, rowIndex, isOpen);
      return null;
    },
    [item, rowIndex, renderCell, isOpen]
  );

  const RowComponent = onRowPress ? TouchableOpacity : View;
  const rowProps = onRowPress ? { onPress: handleRowPress, activeOpacity: 0.7 } : {};

  return (
    <View style={[styles.rowWrap, { zIndex, elevation: zIndex }]}>
      <RowComponent
        style={styles.row}
        {...rowProps}
      >
        {/* Leading cell (accent + checkbox) */}
        {leadingColumnWidth != null && leadingColumnWidth > 0 && (
          <View style={{ width: leadingColumnWidth }}>
            {renderLeadingCell?.(item, rowIndex) ?? null}
          </View>
        )}

        {/* Data columns */}
        {columns.map((col) => {
          const isAction = col.key === actionColumnKey;
          const cellNode = resolveCell(col);

          if (isAction) {
            return (
              <TouchableOpacity
                key={col.key}
                style={{ width: col.width }}
                onPress={(e) => {
                  e.stopPropagation();
                  isOpen ? onClose() : onOpenRequest();
                }}
                activeOpacity={0.8}
              >
                {cellNode}
              </TouchableOpacity>
            );
          }

          if (col.onPress) {
            return (
              <TouchableOpacity
                key={col.key}
                style={[
                  { width: col.width },
                  col.align === "center" && styles.alignCenter,
                  col.align === "right" && styles.alignRight,
                ]}
                onPress={() => col.onPress?.(item, rowIndex)}
                activeOpacity={0.7}
              >
                {cellNode}
              </TouchableOpacity>
            );
          }

          return (
            <View
              key={col.key}
              style={[
                { width: col.width },
                col.align === "center" && styles.alignCenter,
                col.align === "right" && styles.alignRight,
              ]}
            >
              {cellNode}
            </View>
          );
        })}
      </RowComponent>

      {/* Per-row dropdown */}
      {isOpen && renderDropdown && (
        <View
          style={[
            styles.dropdown,
            { left: actionLeft, width: actionColWidth },
          ]}
        >
          {renderDropdown(item, rowIndex, onClose)}
        </View>
      )}
    </View>
  );
}) as <T>(props: DynamicRowProps<T>) => React.ReactElement;

// ─── DynamicTable ─────────────────────────────────────────────────────────────

function DynamicTable<T = any>({
  sectionTitle,
  columns,
  data,
  renderCell,
  renderDropdown,
  actionColumnKey,
  leadingColumnWidth,
  renderLeadingCell,
  onRowPress,
  loading = false,
  emptyText = "No records found.",
  keyExtractor,
  rowZIndex = 1,
  openRowZIndex = 9999,
  collapsible = true,
  maxHeight = 300,
}: DynamicTableProps<T>): React.ReactElement {
  const [collapsed, setCollapsed] = useState(false);
  const [openRowIndex, setOpenRowIndex] = useState<number | null>(null);

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((v) => !v);
    setOpenRowIndex(null);
  }, []);

  const handleOpenRow = useCallback((i: number) => {
    setOpenRowIndex(i);
  }, []);

  const handleCloseRow = useCallback(() => {
    setOpenRowIndex(null);
  }, []);

  const resolveKey = useCallback(
    (item: T, i: number) =>
      keyExtractor ? keyExtractor(item, i) : String(i),
    [keyExtractor]
  );

  // Header cells are stable — only recalculate when columns change
  const headerCells = useMemo(
    () =>
      columns.map((col) => (
        <Text
          key={col.key}
          style={[
            styles.colHead,
            { width: col.width },
            col.align === "center" && styles.alignCenter,
            col.align === "right" && styles.alignRight,
          ]}
        >
          {col.title}
        </Text>
      )),
    [columns]
  );

  return (
    <View style={styles.container}>
      {/* ── Section header ──────────────────────────────────────────────── */}
      {sectionTitle != null && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          {collapsible && (
            <TouchableOpacity
              style={styles.chevronBox}
              onPress={handleToggleCollapse}
              activeOpacity={0.7}
            >
              <Ionicons
                name={collapsed ? "chevron-up" : "chevron-down-sharp"}
                size={18}
                color="#E6E6E6"
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Table body ──────────────────────────────────────────────────── */}
      {(!collapsed || !collapsible) && (
        <StickyHeaderTable<T>
          columns={columns}
          data={data}
          headerCells={headerCells}
          leadingColumnWidth={leadingColumnWidth}
          loading={loading}
          emptyText={emptyText}
          renderCell={renderCell}
          renderDropdown={renderDropdown}
          actionColumnKey={actionColumnKey}
          renderLeadingCell={renderLeadingCell}
          onRowPress={onRowPress}
          openRowIndex={openRowIndex}
          handleOpenRow={handleOpenRow}
          handleCloseRow={handleCloseRow}
          rowZIndex={rowZIndex}
          openRowZIndex={openRowZIndex}
          resolveKey={resolveKey}
          maxHeight={maxHeight}
        />
      )}
    </View>
  );
}

// Export a memoised version so parent re-renders don't cascade unless props change
export default memo(DynamicTable) as typeof DynamicTable;

// ─── StickyHeaderTable — fixed header + scrollable rows ──────────────────────

interface StickyHeaderTableProps<T> {
  columns: Column<T>[];
  data: T[];
  headerCells: ReactNode[];
  leadingColumnWidth?: number;
  loading: boolean;
  emptyText: string;
  renderCell?: DynamicTableProps<T>["renderCell"];
  renderDropdown?: DynamicTableProps<T>["renderDropdown"];
  actionColumnKey?: string;
  renderLeadingCell?: (item: T, rowIndex: number) => ReactNode;
  onRowPress?: (item: T, rowIndex: number) => void;
  openRowIndex: number | null;
  handleOpenRow: (i: number) => void;
  handleCloseRow: () => void;
  rowZIndex: number;
  openRowZIndex: number;
  resolveKey: (item: T, i: number) => string;
  maxHeight: number;
}

function StickyHeaderTable<T>({
  columns, data, headerCells, leadingColumnWidth, loading, emptyText,
  renderCell, renderDropdown, actionColumnKey, renderLeadingCell, onRowPress,
  openRowIndex, handleOpenRow, handleCloseRow, rowZIndex, openRowZIndex, resolveKey,
  maxHeight,
}: StickyHeaderTableProps<T>) {
  const headerScrollRef = useRef<ScrollView>(null);
  const bodyHScrollRef = useRef<ScrollView>(null);
  const isSyncingHeader = useRef(false);
  const isSyncingBody = useRef(false);

  const onHeaderScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isSyncingHeader.current) { isSyncingHeader.current = false; return; }
      isSyncingBody.current = true;
      bodyHScrollRef.current?.scrollTo({ x: e.nativeEvent.contentOffset.x, animated: false });
    }, []
  );

  const onBodyScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isSyncingBody.current) { isSyncingBody.current = false; return; }
      isSyncingHeader.current = true;
      headerScrollRef.current?.scrollTo({ x: e.nativeEvent.contentOffset.x, animated: false });
    }, []
  );

  return (
    <View>
      {/* Fixed header — horizontal sync only */}
      <ScrollView
        ref={headerScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={onHeaderScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.tableHeader}>
          {leadingColumnWidth != null && leadingColumnWidth > 0 && (
            <View style={{ width: leadingColumnWidth }} />
          )}
          {headerCells}
        </View>
      </ScrollView>

      {/* Horizontal scroll wrapper — synced with header */}
      <ScrollView
        ref={bodyHScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        onScroll={onBodyScroll}
        scrollEventThrottle={16}
      >
        {/* Vertical scroll — rows only */}
        <ScrollView
          vertical
          showsVerticalScrollIndicator={false}
          style={{ maxHeight }}
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled
        >
          {loading && (
            <View style={styles.centeredState}>
              <ActivityIndicator size="small" color="#00DEAB" />
            </View>
          )}
          {!loading && data.length === 0 && (
            <View style={styles.centeredState}>
              <Text style={styles.emptyText}>{emptyText}</Text>
            </View>
          )}
          {!loading &&
            data.map((item, i) => (
              <DynamicRow<T>
                key={resolveKey(item, i)}
                item={item}
                rowIndex={i}
                columns={columns}
                renderCell={renderCell}
                renderDropdown={renderDropdown}
                actionColumnKey={actionColumnKey}
                leadingColumnWidth={leadingColumnWidth}
                renderLeadingCell={renderLeadingCell}
                onRowPress={onRowPress}
                isOpen={openRowIndex === i}
                onOpenRequest={() => handleOpenRow(i)}
                onClose={handleCloseRow}
                rowZIndex={rowZIndex}
                openRowZIndex={openRowZIndex}
              />
            ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

// ─── Styles — pixel-perfect copy of original TaskTable / TaskRow ──────────────

const styles = StyleSheet.create({
  // Container
  container: { marginBottom: 24 },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontFamily: "SF_Pro_Medium", color: "#1F2937" },
  chevronBox: {
    width: 25,
    height: 25,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E6E6E6",
    alignItems: "center",
    justifyContent: "center",
  },

  // Table header row
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E6E6E6",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 2,
    alignItems: "center",
  },
  colHead: {
    fontSize: 12,
    fontFamily: "SF_Pro_Medium",
    color: "#1D1D1D",
    paddingRight: 8,
  },

  // Data row wrapper (needed for z-index elevation on open dropdown)
  rowWrap: { position: "relative" },

  // Data row
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
  },

  // Dropdown floats below the row, overlays rows underneath
  dropdown: {
    position: "absolute",
    top: 52,
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

  // Alignment helpers
  alignCenter: { alignItems: "center" },
  alignRight: { alignItems: "flex-end" },

  // States
  centeredState: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontFamily: "SF_Pro_Regular",
  },
});
