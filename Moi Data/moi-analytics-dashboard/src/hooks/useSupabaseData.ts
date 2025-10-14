import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

interface QueryOptions {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  realtime?: boolean;
}

interface UseSupabaseDataResult<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isStale: boolean;
}

/**
 * Custom hook for fetching and managing Supabase data with caching and real-time updates
 * Prevents infinite loops and optimizes performance
 */
export function useSupabaseData<T = any>(
  options: QueryOptions,
  dependencies: any[] = []
): UseSupabaseDataResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  // Use refs to prevent infinite loops
  const channelRef = useRef<RealtimeChannel | null>(null);
  const cacheRef = useRef<{ data: T[]; timestamp: number } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Stable fetch function using useCallback
  const fetchData = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      // Check cache first (5 minute TTL)
      const now = Date.now();
      if (cacheRef.current && (now - cacheRef.current.timestamp) < 300000) {
        setData(cacheRef.current.data);
        setLoading(false);
        setIsStale(false);
        return;
      }
      
      // Build query
      let query = supabase.from(options.table).select(options.select || '*');
      
      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }
      
      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true
        });
      }
      
      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      // Execute query with abort signal
      const { data: result, error: queryError } = await query.abortSignal(
        abortControllerRef.current.signal
      );
      
      if (queryError) throw queryError;
      
      // Update cache
      cacheRef.current = {
        data: result || [],
        timestamp: now
      };
      
      setData(result);
      setIsStale(false);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err);
        console.error('Supabase query error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [options.table, options.select, JSON.stringify(options.filters), 
      JSON.stringify(options.orderBy), options.limit]);
  
  // Setup real-time subscription
  useEffect(() => {
    if (!options.realtime) return;
    
    // Clean up previous subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    
    // Create new subscription
    const channel = supabase
      .channel(`${options.table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: options.table,
          filter: options.filters ? Object.entries(options.filters)
            .map(([key, value]) => `${key}=eq.${value}`)
            .join(',') : undefined
        },
        (payload) => {
          // Mark cache as stale on any change
          setIsStale(true);
          
          // Optimistic update for better UX
          if (payload.eventType === 'INSERT' && data) {
            setData([...data, payload.new as T]);
          } else if (payload.eventType === 'DELETE' && data) {
            setData(data.filter((item: any) => item.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE' && data) {
            setData(data.map((item: any) => 
              item.id === payload.new.id ? payload.new : item
            ) as T[]);
          }
        }
      )
      .subscribe();
    
    channelRef.current = channel;
    
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [options.table, options.realtime]);
  
  // Initial fetch and dependency updates
  useEffect(() => {
    fetchData();
    
    return () => {
      // Cleanup on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, ...dependencies]);
  
  return {
    data,
    loading,
    error,
    refetch: fetchData,
    isStale
  };
}

/**
 * Hook for paginated data fetching
 */
export function useSupabasePagination<T = any>(
  table: string,
  pageSize: number = 20,
  filters?: Record<string, any>
) {
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const { data, loading, error, refetch } = useSupabaseData<T>({
    table,
    filters,
    limit: pageSize,
    orderBy: { column: 'created_at', ascending: false }
  }, [page]);
  
  // Fetch total count
  useEffect(() => {
    const fetchCount = async () => {
      let query = supabase.from(table).select('*', { count: 'exact', head: true });
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }
      
      const { count } = await query;
      setTotalCount(count || 0);
      setHasMore((page + 1) * pageSize < (count || 0));
    };
    
    fetchCount();
  }, [table, filters, page, pageSize]);
  
  const nextPage = useCallback(() => {
    if (hasMore) setPage(p => p + 1);
  }, [hasMore]);
  
  const previousPage = useCallback(() => {
    if (page > 0) setPage(p => p - 1);
  }, [page]);
  
  const goToPage = useCallback((pageNum: number) => {
    const maxPage = Math.ceil(totalCount / pageSize) - 1;
    setPage(Math.max(0, Math.min(pageNum, maxPage)));
  }, [totalCount, pageSize]);
  
  return {
    data,
    loading,
    error,
    refetch,
    page,
    totalCount,
    hasMore,
    nextPage,
    previousPage,
    goToPage,
    totalPages: Math.ceil(totalCount / pageSize)
  };
}

/**
 * Hook for single record fetching with optimistic updates
 */
export function useSupabaseRecord<T = any>(
  table: string,
  id: string | null,
  realtime: boolean = true
) {
  return useSupabaseData<T>({
    table,
    filters: id ? { id } : undefined,
    limit: 1,
    realtime
  }, [id]);
}