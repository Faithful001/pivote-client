import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

// Fetch current logged-in user profile
export const useMe = () => {
  return useQuery<User, Error>({
    queryKey: ["me"],
    queryFn: async () => {
      const url = `/users/me`;
      const response = await apiClient.get<ApiResponse<User>>(url);
      const user = response.data.data;
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    },
    retry: false,
    enabled: !!localStorage.getItem("token"),
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      const response = await apiClient.post<AuthResponse>("/auth/login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("login data", data);
      localStorage.setItem("token", data.data.token);
      queryClient.setQueryData(["me"], data.data.user);
    },
  });
};

// Admin login mutation
export const useAdminLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      const response = await apiClient.post<AuthResponse>("/auth/admin/login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("login data", data);
      localStorage.setItem("token", data.data.token);
      queryClient.setQueryData(["me"], data.data.user);
    },
  });
};

// Register mutation
export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData: Record<string, string>) => {
      const response = await apiClient.post<ApiResponse<User>>("/auth/register", userData);
      return response.data;
    },
  });
};

// Admin Register mutation
export const useAdminRegister = () => {
  return useMutation({
    mutationFn: async (userData: Record<string, string>) => {
      const response = await apiClient.post<ApiResponse<User>>("/auth/admin/register", userData);
      return response.data;
    },
  });
};

// Verify account OTP mutation
export const useVerifyAccount = () => {
  return useMutation({
    mutationFn: async (verifyData: { email: string; otp: string }) => {
      const response = await apiClient.post<ApiResponse<null>>("/auth/verify-account", verifyData);
      return response.data;
    },
  });
};

// Admin Verify account OTP mutation
export const useAdminVerifyAccount = () => {
  return useMutation({
    mutationFn: async (verifyData: { email: string; otp: string }) => {
      const response = await apiClient.post<ApiResponse<null>>(
        "/auth/admin/verify-account",
        verifyData
      );
      return response.data;
    },
  });
};

// Update user details mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, { name });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
};

// Forgot password mutation
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const response = await apiClient.post<ApiResponse<null>>("/auth/forgot-password", payload);
      return response.data;
    },
  });
};

// Forgot password mutation
export const useAdminForgotPassword = () => {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const response = await apiClient.post<ApiResponse<null>>(
        "/auth/admin/forgot-password",
        payload
      );
      return response.data;
    },
  });
};

// Reset password mutation
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const response = await apiClient.post<ApiResponse<null>>("/auth/reset-password", payload);
      return response.data;
    },
  });
};

// Admin Reset password mutation
export const useAdminResetPassword = () => {
  return useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const response = await apiClient.post<ApiResponse<null>>(
        "/auth/admin/reset-password",
        payload
      );
      return response.data;
    },
  });
};
