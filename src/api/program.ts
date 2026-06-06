import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { type ApiResponse } from "./auth";

export interface Program {
  id: string;
  name: string;
  description: string;
  access_code: string;
  is_active: boolean;
  is_joined: boolean;
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
    mutationFn: async (
      programData: Omit<
        Program,
        "id" | "created_at" | "updated_at" | "access_code" | "is_active" | "is_joined"
      >
    ) => {
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
    mutationFn: async ({ id, ...programData }: Partial<Program> & { id: string }) => {
      const response = await apiClient.put<ApiResponse<Program>>(`/programs/${id}`, programData);
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

export const useJoinProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, access_code }: { id: string; access_code: string }) => {
      const response = await apiClient.post<ApiResponse<void>>(`/programs/${id}/join`, {
        access_code,
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
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const response = await apiClient.patch<ApiResponse<Program>>(`/programs/${id}/toggle`, {
        is_active,
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["programs", data.id] });
    },
  });
};

export const useProgramAccessCode = (id: string, enabled: boolean) => {
  return useQuery<{ access_code: string }, Error>({
    queryKey: ["programs", id, "request-code"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ access_code: string }>>(
        `/programs/${id}/request-code`
      );
      return response.data.data;
    },
    enabled: enabled && !!id,
  });
};
