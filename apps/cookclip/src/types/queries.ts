import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

// GET 요청용 공통 타입 (TQueryFnData: API 응답, TData: select 후 데이터)
export type UseQueryOptionsBase<TQueryFnData, TData = TQueryFnData> = Omit<
  UseQueryOptions<TQueryFnData, Error, TData>,
  'queryKey' | 'queryFn'
>;

// POST/PUT/PATCH/DELETE 요청용 공통 타입
export type UseMutationOptionsBase<TData, TVariables> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  'mutationFn'
>;
