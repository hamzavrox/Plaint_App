import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
} from "react";
import * as tasksService from "@/services/api/tasks.service";
import {
  TaskListItem,
  TaskListResponse,
  TaskPriority,
  TaskOwner,
  TaskNote,
  TaskFilter,
  CreateTaskRequest,
  UpdateTaskStatusRequest,
} from "@/types/task.types";
import { MappedTaskRow, mapTaskListResponse } from "@/utils/statusMapper";
import { extractErrorMessage } from "@/utils/errorHandler";

type TaskState = {
  assignedToMe: TaskListItem[];
  createdByMe: TaskListItem[];
  allOtherTasks: TaskListItem[];
  priorities: TaskPriority[];
  taskOwners: TaskOwner[];
  statusList: string[];
  loading: boolean;
  error: string | null;
  activeFilter: TaskFilter | null;
};

type TaskAction =
  | {
      type: "LOAD_SUCCESS";
      data: TaskListResponse;
    }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_FILTER"; filter: TaskFilter | null }
  | { type: "LOGOUT" };

const initialState: TaskState = {
  assignedToMe: [],
  createdByMe: [],
  allOtherTasks: [],
  priorities: [],
  taskOwners: [],
  statusList: [],
  loading: false,
  error: null,
  activeFilter: null,
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "LOAD_SUCCESS":
      return {
        ...state,
        assignedToMe: action.data.tasks_assigned_to_me,
        createdByMe: action.data.tasksByme,
        allOtherTasks: action.data.all_other_tasks,
        priorities: action.data.priority,
        taskOwners: action.data.task_owner,
        statusList: action.data.status,
        loading: false,
        error: null,
      };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_ERROR":
      return { ...state, error: action.error, loading: false };
    case "SET_FILTER":
      return { ...state, activeFilter: action.filter };
    case "LOGOUT":
      return initialState;
    default:
      return state;
  }
}

export type TaskContextValue = {
  state: TaskState;
  mappedAssignedToMe: MappedTaskRow[];
  mappedCreatedByMe: MappedTaskRow[];
  mappedAllOtherTasks: MappedTaskRow[];
  allMappedTasks: MappedTaskRow[];
  filteredMappedTasks: MappedTaskRow[];
  dueTodayCount: number;
  totalCount: number;
  fetchAllTasks: (companyId: number) => Promise<void>;
  fetchFiltered: (companyId: number, filter: TaskFilter) => Promise<void>;
  setActiveFilter: (filter: TaskFilter | null) => void;
  createTask: (data: CreateTaskRequest) => Promise<number>;
  updateTaskStatusLocal: (taskId: string, status: string) => void;
  updateTaskStatusApi: (taskId: number, data: UpdateTaskStatusRequest) => Promise<void>;
  refreshTasks: (companyId: number) => Promise<void>;
  addNote: (
    taskId: number,
    data: { notes: string; company_id: number; company_identifier: string },
    file?: { uri: string; name: string; type: string }
  ) => Promise<void>;
  fetchNotes: (taskId: number) => Promise<TaskNote[]>;
  deleteNote: (
    noteId: number,
    companyId: number,
    companyIdentifier: string
  ) => Promise<void>;
  pinNote: (
    noteId: number,
    pinned: boolean,
    companyId: number,
    companyIdentifier: string
  ) => Promise<void>;
  approveTask: (taskId: number) => Promise<void>;
  rejectTask: (taskId: number, reason: string) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  logout: () => void;
};

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [dueTodayCount, setDueTodayCount] = useState(0);
  const [filteredMappedTasks, setFilteredMappedTasks] = useState<MappedTaskRow[]>([]);

  const mappedAssignedToMe = useMemo(
    () => mapTaskListResponse({ tasks_assigned_to_me: state.assignedToMe, tasksByme: [], all_other_tasks: [], task_owner: [], priority: [], status: [] }).assignedToMe,
    [state.assignedToMe]
  );

  const mappedCreatedByMe = useMemo(
    () => mapTaskListResponse({ tasks_assigned_to_me: [], tasksByme: state.createdByMe, all_other_tasks: [], task_owner: [], priority: [], status: [] }).createdByMe,
    [state.createdByMe]
  );

  const mappedAllOtherTasks = useMemo(
    () => mapTaskListResponse({ tasks_assigned_to_me: [], tasksByme: [], all_other_tasks: state.allOtherTasks, task_owner: [], priority: [], status: [] }).allOtherTasks,
    [state.allOtherTasks]
  );

  const allMappedTasks = useMemo(() => {
    const response: TaskListResponse = {
      tasks_assigned_to_me: state.assignedToMe,
      tasksByme: state.createdByMe,
      all_other_tasks: state.allOtherTasks,
      task_owner: [],
      priority: [],
      status: [],
    };
    const mapped = mapTaskListResponse(response);
    return [...mapped.assignedToMe, ...mapped.createdByMe, ...mapped.allOtherTasks];
  }, [state.assignedToMe, state.createdByMe, state.allOtherTasks]);

  const totalCount = allMappedTasks.length;

  const fetchAllTasks = useCallback(async (companyId: number) => {
    dispatch({ type: "SET_LOADING", loading: true });
    setFilteredMappedTasks([]);
    try {
      const res = await tasksService.getAllTasks(companyId);
      if (res.Good && res.data) {
        dispatch({ type: "LOAD_SUCCESS", data: res.data });
        dispatch({ type: "SET_FILTER", filter: null });
        const todayRes = await tasksService.getDueTodayTasks(companyId);
        if (todayRes.Good && todayRes.data) {
          setDueTodayCount(
            todayRes.data.tasks_assigned_to_me.length +
              todayRes.data.tasksByme.length +
              todayRes.data.all_other_tasks.length
          );
        }
      } else {
        dispatch({ type: "SET_ERROR", error: res.message ?? "Failed to load tasks" });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", error: extractErrorMessage(error) });
    }
  }, []);

  const fetchFiltered = useCallback(
    async (companyId: number, filter: TaskFilter) => {
      dispatch({ type: "SET_LOADING", loading: true });
      try {
        const res = await tasksService.getFilteredTasks(companyId, filter);
        if (res.Good && res.data) {
          const mapped = mapTaskListResponse(res.data);
          setFilteredMappedTasks([
            ...mapped.assignedToMe,
            ...mapped.createdByMe,
            ...mapped.allOtherTasks,
          ]);
          dispatch({ type: "SET_FILTER", filter });
          dispatch({ type: "SET_LOADING", loading: false });
        } else {
          dispatch({
            type: "SET_ERROR",
            error: res.message ?? "Failed to load filtered tasks",
          });
        }
      } catch (error) {
        dispatch({ type: "SET_ERROR", error: extractErrorMessage(error) });
      }
    },
    []
  );

  const setActiveFilter = useCallback((filter: TaskFilter | null) => {
    dispatch({ type: "SET_FILTER", filter });
  }, []);

  const createTask = useCallback(
    async (data: CreateTaskRequest): Promise<number> => {
      const res = await tasksService.createTask(data);
      if (res.Good && res.data && typeof res.data === "object" && "id" in res.data) {
        return (res.data as { id: number }).id;
      }
      throw new Error(typeof res.data === "string" ? res.data : "Failed to create task");
    },
    []
  );

  const updateTaskStatusLocal = useCallback((taskId: string, status: string) => {
    const update = (items: TaskListItem[]): TaskListItem[] =>
      items.map((t) =>
        String(t.id) === taskId
          ? { ...t, status: status as TaskListItem["status"] }
          : t
      );
    dispatch({
      type: "LOAD_SUCCESS",
      data: {
        tasks_assigned_to_me: update(state.assignedToMe),
        tasksByme: update(state.createdByMe),
        all_other_tasks: update(state.allOtherTasks),
        task_owner: state.taskOwners,
        priority: state.priorities,
        status: state.statusList,
      },
    });
  }, [state]);

  const refreshTasks = useCallback(
    async (companyId: number) => {
      await fetchAllTasks(companyId);
    },
    [fetchAllTasks]
  );

  const addNoteToTask = useCallback(
    async (
      taskId: number,
      data: { notes: string; company_id: number; company_identifier: string },
      file?: { uri: string; name: string; type: string }
    ) => {
      await tasksService.addNote(taskId, data, file);
    },
    []
  );

  const fetchNotes = useCallback(async (taskId: number): Promise<TaskNote[]> => {
    const res = await tasksService.getTaskNotes(taskId);
    if (res.Good && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  }, []);

  const deleteNoteById = useCallback(
    async (noteId: number, companyId: number, companyIdentifier: string) => {
      await tasksService.deleteNote(noteId, {
        company_id: companyId,
        company_identifier: companyIdentifier,
      });
    },
    []
  );

  const pinNoteById = useCallback(
    async (
      noteId: number,
      pinned: boolean,
      companyId: number,
      companyIdentifier: string
    ) => {
      await tasksService.pinNote(noteId, {
        pin_top: pinned ? 1 : 0,
        company_id: companyId,
        company_identifier: companyIdentifier,
      });
    },
    []
  );

  const approveTaskById = useCallback(async (taskId: number) => {
    const res = await tasksService.approveTask(taskId);
    if (!res.Good) {
      throw new Error(typeof res.data === "string" ? res.data : "Failed to approve task");
    }
  }, []);

  const rejectTaskById = useCallback(async (taskId: number, reason: string) => {
    const res = await tasksService.rejectTask(taskId, {
      rejection_reason: reason,
    });
    if (!res.Good) {
      throw new Error(typeof res.data === "string" ? res.data : "Failed to reject task");
    }
  }, []);

  const deleteTaskById = useCallback(async (taskId: number) => {
    const res = await tasksService.deleteTask(taskId);
    if (!res.Good) {
      throw new Error(typeof res.data === "string" ? res.data : "Failed to delete task");
    }
  }, []);

  const updateTaskStatusApi = useCallback(
    async (taskId: number, data: UpdateTaskStatusRequest) => {
      const res = await tasksService.updateTaskStatus(taskId, data);
      if (!res.Good) {
        throw new Error(typeof res.data === "string" ? res.data : "Failed to update task status");
      }
    },
    []
  );

  const logout = useCallback(() => {
    setFilteredMappedTasks([]);
    dispatch({ type: "LOGOUT" });
  }, []);

  const value: TaskContextValue = useMemo(
    () => ({
      state,
      mappedAssignedToMe,
      mappedCreatedByMe,
      mappedAllOtherTasks,
      allMappedTasks,
      filteredMappedTasks,
      dueTodayCount,
      totalCount,
      fetchAllTasks,
      fetchFiltered,
      setActiveFilter,
      createTask,
      updateTaskStatusLocal,
      updateTaskStatusApi,
      refreshTasks,
      addNote: addNoteToTask,
      fetchNotes,
      deleteNote: deleteNoteById,
      pinNote: pinNoteById,
      approveTask: approveTaskById,
      rejectTask: rejectTaskById,
      deleteTask: deleteTaskById,
      logout,
    }),
    [
      state,
      mappedAssignedToMe,
      mappedCreatedByMe,
      mappedAllOtherTasks,
      allMappedTasks,
      filteredMappedTasks,
      dueTodayCount,
      totalCount,
      fetchAllTasks,
      fetchFiltered,
      setActiveFilter,
      createTask,
      updateTaskStatusLocal,
      updateTaskStatusApi,
      refreshTasks,
      addNoteToTask,
      fetchNotes,
      deleteNoteById,
      pinNoteById,
      approveTaskById,
      rejectTaskById,
      deleteTaskById,
      logout,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return ctx;
}
