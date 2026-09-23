import { useEffect, useId } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

/**
 * Subscribe to Postgres changes on a table (scoped to the current user via a
 * server-side filter) and invalidate the given query keys whenever a row
 * changes — so every connected device stays in sync.
 */
export function useRealtimeTable(
  table: string,
  userId: string | undefined,
  invalidateKeys: readonly (readonly unknown[])[],
) {
  const queryClient = useQueryClient();
  // Unique per hook instance: a page can mount several useCloudState hooks,
  // and two channels sharing the same topic name collide and throw on
  // subscribe. useId keeps every subscription's topic distinct.
  const instanceId = useId();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`realtime:${table}:${userId}:${instanceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `user_id=eq.${userId}`,
        },
        () => {
          for (const key of invalidateKeys) {
            queryClient.invalidateQueries({ queryKey: key });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // invalidateKeys is expected to be stable per render-set; callers pass
    // memo-friendly literals. userId/table drive the subscription lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, userId, instanceId]);
}
