import { useMutation } from "@tanstack/react-query";
import type { ApiResponse } from "./auth";
import { apiClient } from "./client";

type OtpPurpose = "verify_account" | "reset_pwd" | "request_join_link" | "register_to_join";

export const useSendOtp = () => {
  return useMutation({
    mutationFn: async ({ email, purpose }: { email: string; purpose: OtpPurpose }) => {
      const response = await apiClient.post<ApiResponse<void>>("/otps/send", { email, purpose });
      return response.data;
    },
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async ({
      email,
      purpose,
      otp,
    }: {
      email: string;
      otp: string;
      purpose: OtpPurpose;
    }) => {
      const response = await apiClient.post<ApiResponse<void>>("/otps/verify", {
        email,
        purpose,
        otp,
      });
      return response.data;
    },
  });
};
