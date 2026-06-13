import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { type ApiResponse } from "./auth";

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export const useWorkspaces = () => {
  return useQuery<Workspace[], Error>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Workspace[]>>("/workspaces");
      return response.data.data;
    },
    enabled: !!localStorage.getItem("token"),
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workspaceData: { name: string }) => {
      const response = await apiClient.post<ApiResponse<Workspace>>("/workspaces", workspaceData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};
