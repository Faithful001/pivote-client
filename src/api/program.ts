import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { type ApiResponse } from "./auth";
import { getErrorMessage } from "../lib/utils/get-error-message.util";
import { toast } from "sonner";

export interface Program {
  id: string;
  name: string;
  description: string;
  access_code: string;
  is_active: boolean;
  voting_ends_at: string;
  created_at: string;
  updated_at: string;
}

export const usePrograms = () => {
  return useQuery<Program[], Error>({
    queryKey: ["programs"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Program[]>>("/programs");
      return response.data.data;
    },
  });
};

export const useProgram = (id: string) => {
  return useQuery<Program, Error>({
    queryKey: ["programs", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Program>>(`/programs/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (programData: { name: string; description: string }) => {
      const response = await apiClient.post<ApiResponse<Program>>("/programs", programData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
  });
};

export const useUpdateProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      voting_ends_at,
      ...programData
    }: Partial<Program> & { id: string; voting_ends_at?: string }) => {
      const response = await apiClient.put<ApiResponse<Program>>(`/programs/${id}`, {
        ...programData,
        voting_ends_at: voting_ends_at,
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["programs", data.id] });
    },
  });
};

export const useDeleteProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/programs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
  });
};

export const useRequestJoinProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, email }: { id: string; email: string }) => {
      const response = await apiClient.post<ApiResponse<void>>(`/programs/${id}/request-join`, {
        email,
      });
      return response.data.message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (err) => {
      const error = getErrorMessage(err);
      toast.error(error);
    },
  });
};

export const useJoinProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, token }: { id: string; token: string }) => {
      const response = await apiClient.post<ApiResponse<void>>(`/programs/${id}/join`, {
        token,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
  });
};

export const useToggleProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      is_active,
      voting_ends_at,
    }: {
      id: string;
      is_active: boolean;
      voting_ends_at: string | null;
    }) => {
      const response = await apiClient.patch<ApiResponse<Program>>(`/programs/${id}/toggle`, {
        is_active,
        voting_ends_at,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["programs", data.data.id] });
    },
    onError: (err) => {
      const error = getErrorMessage(err);
      toast.error(error);
    },
  });
};

export const useRequestJoinLink = () => {
  return useMutation({
    mutationFn: async ({ id, email }: { id: string; email: string }) => {
      const response = await apiClient.post<ApiResponse<void>>(`/programs/${id}/request-join`, {
        email,
      });
      return response.data;
    },
  });
};
