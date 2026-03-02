import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Song } from "../backend.d";
import { useActor } from "./useActor";

// ─── Query hooks ──────────────────────────────────────────────

export function useGetAllSongs() {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSongs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSongsByGenre(genre: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs", "genre", genre],
    queryFn: async () => {
      if (!actor) return [];
      if (!genre) return actor.getAllSongs();
      return actor.getSongsByGenre(genre);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetGenres() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["genres"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGenres();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTopSongs(count: number) {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs", "top", count],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopSongs(BigInt(count));
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mutation hooks ───────────────────────────────────────────

export function useSubmitSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      artist: string;
      genre: string;
      link: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.submitSong(
        params.title,
        params.artist,
        params.genre,
        params.link,
        params.description,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      queryClient.invalidateQueries({ queryKey: ["genres"] });
    },
  });
}

export function useLikeSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.likeSong(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}

export function useDeleteSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteSong(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}
