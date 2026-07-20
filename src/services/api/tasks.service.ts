import { apiGet, apiPost, apiDelete, apiUpload } from "./client";
import { ApiResponse } from "@/types/api.types";
import {
  TaskListResponse,
  TaskDetailData,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  UpdateAssigneeRequest,
  RejectTaskRequest,
  TaskNote,
  AddNoteRequest,
  UpdateNoteRequest,
  PinNoteRequest,
  DeleteNoteRequest,
  NoteReactionRequest,
  DeleteAttachmentRequest,
  UpdateDueDateRequest,
  UpdateProjectRequest,
  TaskFilter,
} from "@/types/task.types";

export async function getAllTasks(
  companyId: number
): Promise<ApiResponse<TaskListResponse>> {
  return apiGet<ApiResponse<TaskListResponse>>("/tasks/all", {
    company_id: companyId,
  });
}

export async function getDueTodayTasks(
  companyId: number
): Promise<ApiResponse<TaskListResponse>> {
  return apiGet<ApiResponse<TaskListResponse>>("/tasks/duetoday", {
    company_id: companyId,
  });
}

export async function getFilteredTasks(
  companyId: number,
  filter: TaskFilter
): Promise<ApiResponse<TaskListResponse>> {
  return apiGet<ApiResponse<TaskListResponse>>("/tasks/filter", {
    company_id: companyId,
    filter,
  });
}

export async function getTaskDetail(
  taskId: number
): Promise<ApiResponse<{ priority: TaskDetailData[] }>> {
  return apiGet<ApiResponse<{ priority: TaskDetailData[] }>>(
    `/tasks/${taskId}`
  );
}

export async function createTask(
  data: CreateTaskRequest
): Promise<ApiResponse<{ id: number }>> {
  return apiPost<ApiResponse<{ id: number }>>("/tasks/create", data);
}

export async function createSubtask(
  parentId: number,
  data: CreateTaskRequest
): Promise<ApiResponse<{ id: number }>> {
  return apiPost<ApiResponse<{ id: number }>>(
    `/tasks/createsubtask/${parentId}`,
    data
  );
}

export async function updateTask(
  taskId: number,
  data: UpdateTaskRequest
): Promise<ApiResponse<string>> {
  return apiPost<ApiResponse<string>>(`/tasks/update/${taskId}`, data);
}

export async function updateTaskStatus(
  taskId: number,
  data: UpdateTaskStatusRequest
): Promise<ApiResponse<string>> {
  return apiPost<ApiResponse<string>>(
    `/tasks/updatetaskstatus/${taskId}`,
    data
  );
}

export async function reassignTask(
  taskId: number,
  data: UpdateAssigneeRequest
): Promise<ApiResponse<string>> {
  return apiPost<ApiResponse<string>>(
    `/tasks/updateasignedto/${taskId}`,
    data
  );
}

export async function deleteTask(
  taskId: number
): Promise<ApiResponse<string>> {
  return apiDelete<ApiResponse<string>>(`/tasks/${taskId}`);
}

export async function approveTask(
  taskId: number
): Promise<ApiResponse<string>> {
  return apiPost<ApiResponse<string>>(`/tasks/approve/${taskId}`, {});
}

export async function rejectTask(
  taskId: number,
  data: RejectTaskRequest
): Promise<ApiResponse<string>> {
  return apiPost<ApiResponse<string>>(`/tasks/reject/${taskId}`, data);
}

export async function viewTask(
  taskId: number
): Promise<ApiResponse<TaskDetailData>> {
  return apiPost<ApiResponse<TaskDetailData>>(`/tasks/view/${taskId}`, {});
}

export async function updateTaskDueDate(
  taskId: number,
  data: UpdateDueDateRequest
): Promise<ApiResponse<string>> {
  return apiPost<ApiResponse<string>>(
    `/tasks/updatetaskduedate/${taskId}`,
    data
  );
}

export async function updateTaskProject(
  taskId: number,
  data: UpdateProjectRequest
): Promise<ApiResponse<string>> {
  return apiPost<ApiResponse<string>>(
    `/tasks/updatetaskproject/${taskId}`,
    data
  );
}

export async function updateLeadSource(
  taskId: number,
  data: { source: string; company_id: number; company_identifier: string }
): Promise<ApiResponse<string>> {
  return apiPost<ApiResponse<string>>(
    `/tasks/updateleadsource/${taskId}`,
    data
  );
}

export async function addNote(
  taskId: number,
  data: AddNoteRequest,
  file?: File | { uri: string; name: string; type: string }
): Promise<ApiResponse<string>> {
  const formData = new FormData();
  formData.append("notes", data.notes);
  formData.append("company_id", String(data.company_id));
  formData.append("company_identifier", data.company_identifier);
  if (data.reply_to) {
    formData.append("reply_to", JSON.stringify(data.reply_to));
  }
  if (file) {
    formData.append("file", file as unknown as Blob);
  }
  return apiUpload<ApiResponse<string>>(`/tasks/addnote/${taskId}`, formData);
}

export async function getTaskNotes(
  taskId: number,
  companyId?: number,
  companyIdentifier?: string
): Promise<ApiResponse<TaskNote[]>> {
  const body: Record<string, any> = {};
  if (companyId !== undefined) {
    body.company_id = companyId;
  }
  if (companyIdentifier !== undefined) {
    body.company_identifier = companyIdentifier;
  }
  return apiPost<ApiResponse<TaskNote[]>>(
    `/tasks/showtasknote/${taskId}`,
    body
  );
}

export async function updateNote(
  noteId: number,
  data: UpdateNoteRequest
): Promise<ApiResponse<string>> {
  return apiPost<ApiResponse<string>>(`/tasks/updatenote/${noteId}`, data);
}

export async function pinNote(
  noteId: number,
  data: PinNoteRequest
): Promise<ApiResponse<string>> {
  return apiPost<ApiResponse<string>>(`/tasks/updatenotepin/${noteId}`, data);
}

export async function deleteNote(
  noteId: number,
  data: DeleteNoteRequest
): Promise<ApiResponse<string>> {
  return apiPost<ApiResponse<string>>(`/tasks/deletenote/${noteId}`, data);
}

export async function updateNoteReaction(
  noteId: number,
  data: NoteReactionRequest
): Promise<ApiResponse<string>> {
  return apiPost<ApiResponse<string>>(
    `/tasks/updatenotereaction/${noteId}`,
    data
  );
}

export async function uploadAttachment(
  taskId: number,
  formData: FormData
): Promise<ApiResponse<{ id: number; attachment_file: string }>> {
  return apiUpload<ApiResponse<{ id: number; attachment_file: string }>>(
    `/tasks/attachments/${taskId}`,
    formData
  );
}

export async function deleteAttachment(
  attachmentId: number,
  data: DeleteAttachmentRequest
): Promise<ApiResponse<string>> {
  return apiPost<ApiResponse<string>>(
    `/tasks/attachmentdelete/${attachmentId}`,
    data
  );
}
