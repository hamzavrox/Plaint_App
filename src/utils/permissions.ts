import { TaskListItem } from "@/types/task.types";

export function canEditTask(task: TaskListItem, userId: number): boolean {
  return task.can_edit === true || task.created_by === userId;
}

export function canEditStatus(task: TaskListItem): boolean {
  return task.can_edit_status === true;
}

export function canDeleteTask(task: TaskListItem, userId: number): boolean {
  return task.created_by === userId;
}

export function canReassignTask(task: TaskListItem, userId: number): boolean {
  return task.created_by === userId;
}

export function canApproveReject(
  task: TaskListItem,
  userId: number,
  isAdmin: boolean
): boolean {
  return task.created_by === userId || isAdmin;
}

export function canCreateSubtask(
  task: TaskListItem,
  userId: number,
  isAdmin: boolean
): boolean {
  return task.can_edit_subtask === true || task.created_by === userId || isAdmin;
}

export function hasPermission(
  permissions: string[],
  required: string
): boolean {
  return permissions.includes(required);
}
