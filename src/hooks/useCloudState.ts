import { useCallback, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { plannerSettingsRepository } from "@/repositories/planner-settings.repository";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "./useRealtimeTable";
import type { Json } from "@/types/database.types";

/**
 * Drop-in replacement for the old `useLocalStorage` hook, backed by the
 * `planner_settings` table. Same `[value, setValue]` signature (including
 * functional updates), so wiring a route to the cloud is a one-line import
 * swap. Writes are optimistic (instant UI) and debounced (one upsert per
 * ~500ms burst); realtime keeps other devices in sync.
 */
export function useCloudState<T>(
  key: string,
  initial: T,
): [T, (v: T | ((prev: T) => T)) => void] {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const qKey = queryKeys.cloudState(userId ?? "anon", key);

  const query = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      const stored = await plannerSettingsRepository.get<T>(userId!, key);
      return stored === null ? initial : stored;
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
    retry: 2,
  });

  useRealtimeTable("planner_settings", userId, [qKey]);

  const mutation = useMutation({
    mutationFn: (value: T) =>
      plannerSettingsRepository.set(userId!, key, value as unknown as Json),
  });

  // Debounce network writes so rapid edits (typing) don't spam upserts.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest value with a write still pending, so we can flush on unmount and
  // never lose an edit made moments before navigating away.
  const pendingRef = useRef<{ value: T } | null>(null);

  // Keep the persist target current for the unmount flush.
  const persistRef = useRef<{ userId?: string; key: string }>({ userId, key });
  persistRef.current = { userId, key };

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const pending = pendingRef.current;
      const { userId: uid, key: k } = persistRef.current;
      if (pending && uid) {
        // Fire-and-forget flush of the last unsaved value.
        void plannerSettingsRepository.set(uid, k, pending.value as unknown as Json);
        pendingRef.current = null;
      }
    },
    [],
  );

  const value = (query.data ?? initial) as T;

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = (queryClient.getQueryData<T>(qKey) ?? initial) as T;
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(current) : next;

      // Optimistic: update cache immediately.
      queryClient.setQueryData<T>(qKey, resolved);

      if (!userId) return; // not signed in yet — cache-only (shouldn't happen behind the guard)

      pendingRef.current = { value: resolved };
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        pendingRef.current = null;
        mutation.mutate(resolved);
      }, 500);
    },
    // `initial` is stable per mount; mutation/queryClient are stable refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [qKey, userId],
  );

  return [value, setValue];
}
