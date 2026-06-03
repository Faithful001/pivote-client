import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { type ApiResponse } from './auth';

export interface Vote {
  id: string;
  candidate_id: string;
  user_id: string;
  program_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProgramVotesInfo {
  total_votes: number;
  votes_by_candidate: Record<string, number>; // maps candidate_id to count
  user_vote_candidate_id?: string | null;
}

export const useProgramVotes = (programId: string) => {
  return useQuery<ProgramVotesInfo, Error>({
    queryKey: ['votes', 'program', programId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ProgramVotesInfo>>(`/votes/program/${programId}`);
      return response.data.data;
    },
    enabled: !!programId,
  });
};

export const useToggleVote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (votePayload: { candidate_id: string; program_id: string }) => {
      const response = await apiClient.post<ApiResponse<{ voted: boolean }>>('/votes/toggle', votePayload);
      return { response: response.data.data, ...votePayload };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['votes', 'program', data.program_id] });
      queryClient.invalidateQueries({ queryKey: ['candidates', 'program', data.program_id] });
    },
  });
};
