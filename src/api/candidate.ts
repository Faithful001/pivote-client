import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { type ApiResponse } from './auth';

export interface Candidate {
  id: string;
  name: string;
  program_id: string;
  created_at: string;
  updated_at: string;
}

export const useCandidates = () => {
  return useQuery<Candidate[], Error>({
    queryKey: ['candidates'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Candidate[]>>('/candidates');
      return response.data.data;
    },
  });
};

export const useCandidate = (id: string) => {
  return useQuery<Candidate, Error>({
    queryKey: ['candidates', id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Candidate>>(`/candidates/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCandidatesByProgram = (programId: string) => {
  return useQuery<Candidate[], Error>({
    queryKey: ['candidates', 'program', programId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Candidate[]>>(`/candidates/program/${programId}`);
      return response.data.data;
    },
    enabled: !!programId,
  });
};

export const useCreateCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (candidateData: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await apiClient.post<ApiResponse<Candidate>>('/candidates', candidateData);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', 'program', data.program_id] });
    },
  });
};

export const useUpdateCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...candidateData }: Partial<Candidate> & { id: string }) => {
      const response = await apiClient.put<ApiResponse<Candidate>>(`/candidates/${id}`, candidateData);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', data.id] });
      queryClient.invalidateQueries({ queryKey: ['candidates', 'program', data.program_id] });
    },
  });
};

export const useDeleteCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, programId }: { id: string; programId: string }) => {
      await apiClient.delete(`/candidates/${id}`);
      return { id, programId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', 'program', data.programId] });
    },
  });
};
