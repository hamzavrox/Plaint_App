import { apiPost } from "./client";
import {
  LoginRequest,
  LoginSuccessResponse,
  LoginDefaultPasswordResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResetPasswordRequest,
  InitialPasswordResetRequest,
} from "@/types/auth.types";

export async function login(data: LoginRequest): Promise<LoginSuccessResponse> {
  return apiPost<LoginSuccessResponse>("/user/login", data);
}

export async function loginCheckDefault(
  data: LoginRequest
): Promise<LoginSuccessResponse | LoginDefaultPasswordResponse> {
  return apiPost<LoginSuccessResponse | LoginDefaultPasswordResponse>(
    "/user/login",
    data
  );
}

export async function verifyEmail(
  data: VerifyEmailRequest
): Promise<VerifyEmailResponse> {
  return apiPost<VerifyEmailResponse>("/user/verify-email", data);
}

export async function resetPassword(data: ResetPasswordRequest) {
  return apiPost<{ success: boolean; message: string }>(
    "/user/reset-password",
    data
  );
}

export async function initialPasswordReset(
  data: InitialPasswordResetRequest
) {
  return apiPost<{ Good: boolean; data: string }>(
    "/user/initial-password-reset",
    data
  );
}
