import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { repo } from "@/repositories/base.repository";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "./useRealtimeTable";
import type { StudyTopic, StudyTrack } from "@/types/models";

const tracksRepo = repo("study_tracks");
const topicsRepo = repo("study_topics");

/** /estudos — trilhas (study_tracks) e tópicos (study_topics). */
export function useEstudos() {
  const { user } = useAuth();
  const userId = user?.id;
  const qc = useQueryClient();
  const tracksKey = queryKeys.studyTracks(userId ?? "anon");
  const topicsKey = queryKeys.studyTopics(userId ?? "anon");

  const tracksQuery = useQuery({
    queryKey: tracksKey,
    queryFn: () => tracksRepo.list("position", true),
    enabled: !!userId,
  });
  const topicsQuery = useQuery({
    queryKey: topicsKey,
    queryFn: () => topicsRepo.list("position", true),
    enabled: !!userId,
  });

  useRealtimeTable("study_tracks", userId, [tracksKey]);
  useRealtimeTable("study_topics", userId, [topicsKey]);

  const topics = topicsQuery.data ?? [];
  const settleTopics = () => qc.invalidateQueries({ queryKey: topicsKey });
  const patchTopics = (fn: (p: StudyTopic[]) => StudyTopic[]) =>
    qc.setQueryData<StudyTopic[]>(topicsKey, (p) => fn(p ?? []));

  const addTopic = useMutation({
    mutationFn: (v: { trackId: string; title: string }) => {
      const siblings = topics.filter((t) => t.track_id === v.trackId);
      const position = siblings.reduce((m, t) => Math.max(m, t.position), -1) + 1;
      return topicsRepo.insert({ track_id: v.trackId, title: v.title, position });
    },
    onSettled: settleTopics,
  });
  const toggleTopic = useMutation({
    mutationFn: (t: StudyTopic) => topicsRepo.update(t.id, { is_done: !t.is_done }),
    onMutate: async (t) => {
      await qc.cancelQueries({ queryKey: topicsKey });
      const prev = qc.getQueryData<StudyTopic[]>(topicsKey) ?? [];
      patchTopics((p) => p.map((x) => (x.id === t.id ? { ...x, is_done: !x.is_done } : x)));
      return { prev };
    },
    onError: (_e, _v, c) => c?.prev && qc.setQueryData(topicsKey, c.prev),
    onSettled: settleTopics,
  });
  const editTopic = useMutation({
    mutationFn: (v: { id: string; title: string }) => topicsRepo.update(v.id, { title: v.title }),
    onSettled: settleTopics,
  });
  const removeTopic = useMutation({
    mutationFn: (id: string) => topicsRepo.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: topicsKey });
      const prev = qc.getQueryData<StudyTopic[]>(topicsKey) ?? [];
      patchTopics((p) => p.filter((x) => x.id !== id));
      return { prev };
    },
    onError: (_e, _v, c) => c?.prev && qc.setQueryData(topicsKey, c.prev),
    onSettled: settleTopics,
  });

  // Swap the display order of two tracks (press-and-hold gesture).
  const swapTracks = useMutation({
    mutationFn: async (v: { a: StudyTrack; b: StudyTrack }) => {
      await tracksRepo.update(v.a.id, { position: v.b.position });
      await tracksRepo.update(v.b.id, { position: v.a.position });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: tracksKey }),
  });

  return {
    tracks: tracksQuery.data ?? [],
    topics,
    isLoading: tracksQuery.isLoading || topicsQuery.isLoading,
    topicsOf: (trackId: string) => topics.filter((t) => t.track_id === trackId),
    addTopic: (trackId: string, title: string) => addTopic.mutate({ trackId, title }),
    toggleTopic: (t: StudyTopic) => toggleTopic.mutate(t),
    editTopic: (id: string, title: string) => editTopic.mutate({ id, title }),
    removeTopic: (id: string) => removeTopic.mutate(id),
    swapTracks: (a: StudyTrack, b: StudyTrack) => swapTracks.mutate({ a, b }),
  };
}
