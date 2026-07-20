export type ApiResponse<T = unknown> = {
  Good: boolean;
  data?: T;
  message?: string;
  msg?: string;
};

export type ApiSuccessEnvelope = {
  Good: true;
  data: string | Record<string, unknown>;
  msg?: string;
};

export type ApiErrorEnvelope = {
  Good: false;
  message?: string;
  data?: string;
  success?: boolean;
};

export type ApiVerifyEmailResponse = {
  success: boolean;
  message: string;
};
