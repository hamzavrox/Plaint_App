import { ApiErrorEnvelope } from "@/types/api.types";

export function extractErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred";

  if (typeof error === "string") return error;

  if (error instanceof Error) {
    const msg = error.message;

    if (msg.includes("Network request failed") || msg.includes("fetch")) {
      return "Network error. Please check your connection.";
    }
    if (msg.includes("timeout")) {
      return "Request timed out. Please try again.";
    }
    return msg;
  }

  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;

    if ("Good" in errObj && errObj.Good === false) {
      const apiErr = error as ApiErrorEnvelope;
      if (apiErr.message) return apiErr.message;
      if (typeof apiErr.data === "string") return apiErr.data;
    }

    if ("message" in errObj && typeof errObj.message === "string") {
      return errObj.message;
    }
  }

  return "An unexpected error occurred. Please try again.";
}

export function getPermissionErrorMessage(action: string): string {
  return `You do not have permission to ${action}.`;
}

export function getValidationError(field: string): string {
  return `${field} is required.`;
}
