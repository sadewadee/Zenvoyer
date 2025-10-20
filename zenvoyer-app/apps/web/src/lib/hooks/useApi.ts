/**
 * useApi Hook
 * Wrapper untuk React Query dengan error handling yang konsisten
 */

import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { isApiError } from '../../types/error';
import { getErrorMessage } from '../api/utils/error-handler';

/**
 * Hook untuk GET requests dengan automatic error handling
 */
export function useApi<TData = any, TError = unknown>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  const query = useQuery<TData, TError>({
    queryKey,
    queryFn,
    retry: (failureCount, error) => {
      // Jangan retry untuk validation atau auth errors
      if (isApiError(error)) {
        const shouldNotRetry = [400, 401, 403, 404, 409, 422].includes(error.statusCode);
        return !shouldNotRetry && failureCount < 3;
      }
      return failureCount < 3;
    },
    ...options,
  });

  return {
    ...query,
    error: query.error as TError,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
  };
}

/**
 * Hook untuk POST/PUT/PATCH/DELETE requests
 */
export function useApiMutation<TData = any, TVariables = any, TError = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>
) {
  const mutation = useMutation<TData, TError, TVariables>({
    mutationFn,
    ...options,
  });

  return {
    ...mutation,
    error: mutation.error as TError,
    errorMessage: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export default {
  useApi,
  useApiMutation,
};
