import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { ChevronDown, Disc3, LogIn, LogOut, Music4, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Song } from "./backend.d";
import { ShareSongModal } from "./components/ShareSongModal";
import { SongCard } from "./components/SongCard";
import { SongsLoadingGrid } from "./components/SongSkeleton";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useDeleteSong,
  useGetAllSongs,
  useGetGenres,
  useLikeSong,
  useSubmitSong,
} from "./hooks/useQueries";

// ── Seed / fallback songs for first-load appearance ──────────────
const SEED_SONGS: Song[] = [
  {
    id: BigInt(-1),
    title: "Redbone",
    artist: "Childish Gambino",
    genre: "R&B",
    link: "https://open.spotify.com/track/0wGnG6ac8mdJ9XY6XFVaxb",
    description:
      "A soulful, slow-burn groove that stays in your head for days.",
    likes: BigInt(248),
    submittedBy: {
      toString: () => "",
      isAnonymous: () => true,
    } as unknown as Song["submittedBy"],
    timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 3) * BigInt(1_000_000),
  },
  {
    id: BigInt(-2),
    title: "Blinding Lights",
    artist: "The Weeknd",
    genre: "Pop",
    link: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b",
    description:
      "Retro synthwave energy with an irresistible chorus. Pure dopamine.",
    likes: BigInt(512),
    submittedBy: {
      toString: () => "",
      isAnonymous: () => true,
    } as unknown as Song["submittedBy"],
    timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 6) * BigInt(1_000_000),
  },
  {
    id: BigInt(-3),
    title: "All Falls Down",
    artist: "Kanye West ft. Syleena Johnson",
    genre: "Hip-Hop",
    link: "https://open.spotify.com/track/3SxJhsNbYHl8fFiB8pLCiK",
    description: "Early Kanye at his most raw and honest. Timeless.",
    likes: BigInt(176),
    submittedBy: {
      toString: () => "",
      isAnonymous: () => true,
    } as unknown as Song["submittedBy"],
    timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 12) * BigInt(1_000_000),
  },
  {
    id: BigInt(-4),
    title: "So What",
    artist: "Miles Davis",
    genre: "Jazz",
    link: "https://open.spotify.com/track/7c7wANWraiHPyYBQBqPRWH",
    description:
      "The opening of Kind of Blue. Modal jazz perfection that never ages.",
    likes: BigInt(334),
    submittedBy: {
      toString: () => "",
      isAnonymous: () => true,
    } as unknown as Song["submittedBy"],
    timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 24) * BigInt(1_000_000),
  },
  {
    id: BigInt(-5),
    title: "One More Time",
    artist: "Daft Punk",
    genre: "Electronic",
    link: "https://open.spotify.com/track/1nGQLDiPbdVS5RaspDEwjx",
    description:
      "Celebrate good times — this one still absolutely bangs every single time.",
    likes: BigInt(621),
    submittedBy: {
      toString: () => "",
      isAnonymous: () => true,
    } as unknown as Song["submittedBy"],
    timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 30) * BigInt(1_000_000),
  },
  {
    id: BigInt(-6),
    title: "Clair de Lune",
    artist: "Claude Debussy",
    genre: "Classical",
    link: "https://open.spotify.com/track/3Yr0GrGNBR2PGBH5xKoHVP",
    description: "Pure impressionist poetry. Moonlight captured in piano keys.",
    likes: BigInt(289),
    submittedBy: {
      toString: () => "",
      isAnonymous: () => true,
    } as unknown as Song["submittedBy"],
    timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 48) * BigInt(1_000_000),
  },
];

export default function App() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;
  const currentPrincipal = identity?.getPrincipal().toString();

  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);

  // Data
  const songsQuery = useGetAllSongs();
  const genresQuery = useGetGenres();
  const submitMutation = useSubmitSong();
  const likeMutation = useLikeSong();
  const deleteMutation = useDeleteSong();

  // Use seed songs if backend returns nothing yet
  const backendSongs = songsQuery.data ?? [];
  const rawSongs = backendSongs.length > 0 ? backendSongs : SEED_SONGS;

  // Genre filtering
  const filteredSongs = useMemo(() => {
    if (!selectedGenre) return rawSongs;
    return rawSongs.filter((s) => s.genre === selectedGenre);
  }, [rawSongs, selectedGenre]);

  // Unique genres from songs (supplement with backend genres)
  const songGenres = useMemo(() => {
    const fromSongs = [...new Set(rawSongs.map((s) => s.genre))];
    const fromBackend = genresQuery.data ?? [];
    return [...new Set([...fromBackend, ...fromSongs])].sort();
  }, [rawSongs, genresQuery.data]);

  const handleShare = async (data: {
    title: string;
    artist: string;
    genre: string;
    link: string;
    description: string;
  }) => {
    try {
      await submitMutation.mutateAsync(data);
      toast.success("Song shared! 🎵", {
        description: `"${data.title}" is now live for everyone to hear.`,
      });
      setIsShareOpen(false);
    } catch {
      toast.error("Could not share song", {
        description: "Please try again.",
      });
    }
  };

  const handleLike = async (id: bigint) => {
    try {
      await likeMutation.mutateAsync(id);
    } catch {
      toast.error("Could not like song");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Song removed");
    } catch {
      toast.error("Could not delete song");
    }
  };

  const handleLoginRequired = () => {
    setLoginPromptVisible(true);
    setTimeout(() => setLoginPromptVisible(false), 3000);
  };

  const isLoading = songsQuery.isLoading || isInitializing;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster theme="dark" position="bottom-right" />

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Disc3
                className="w-8 h-8 animate-[spin_8s_linear_infinite]"
                style={{ color: "oklch(var(--coral))" }}
              />
            </div>
            <span className="font-display font-bold text-xl text-foreground tracking-tight">
              Song<span style={{ color: "oklch(var(--coral))" }}>Share</span>
            </span>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-muted-foreground text-sm truncate max-w-[140px]">
                  {currentPrincipal?.slice(0, 12)}…
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  data-ocid="header.logout_button"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="header.login_button"
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <LogIn className="w-4 h-4" />
                {isLoggingIn ? "Connecting…" : "Login"}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/generated/hero-bg.dim_1600x600.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-8 bg-primary/60" />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "oklch(var(--coral))" }}
              >
                Community music discovery
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-[1.1] mb-4">
              Discover songs{" "}
              <span className="italic" style={{ color: "oklch(var(--amber))" }}>
                worth listening
              </span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-6">
              Share your favourite tracks, explore what others are listening to,
              and build a collective playlist together.
            </p>

            {isAuthenticated ? (
              <Button
                onClick={() => setIsShareOpen(true)}
                data-ocid="songs.share_button"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow h-11 px-6"
              >
                <Plus className="w-4 h-4" />
                Share a Song
              </Button>
            ) : (
              <Button
                onClick={login}
                data-ocid="header.login_button"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-11 px-6"
              >
                <LogIn className="w-4 h-4" />
                Login to Share
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Main Content ───────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pb-16">
        {/* Genre filters + share button bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pt-2">
          {/* Genre pills */}
          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              data-ocid="genre.filter.tab"
              onClick={() => setSelectedGenre(null)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                !selectedGenre
                  ? "bg-primary text-primary-foreground border-primary shadow-glow"
                  : "bg-secondary/60 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              All
            </button>
            {songGenres.map((genre) => (
              <button
                key={genre}
                type="button"
                data-ocid="genre.filter.tab"
                onClick={() =>
                  setSelectedGenre(genre === selectedGenre ? null : genre)
                }
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                  selectedGenre === genre
                    ? "bg-primary text-primary-foreground border-primary shadow-glow"
                    : "bg-secondary/60 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Share button (secondary, visible on mobile too) */}
          {isAuthenticated && (
            <Button
              size="sm"
              onClick={() => setIsShareOpen(true)}
              data-ocid="songs.share_button"
              className="gap-1.5 bg-primary/15 text-coral border border-primary/30 hover:bg-primary/25 hover:border-primary/50 font-semibold"
              style={{ color: "oklch(var(--coral))" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Share
            </Button>
          )}
        </div>

        {/* Songs count */}
        {!isLoading && (
          <p className="text-muted-foreground text-sm mb-4">
            {filteredSongs.length === 0
              ? "No songs found"
              : `${filteredSongs.length} song${filteredSongs.length !== 1 ? "s" : ""}${selectedGenre ? ` in ${selectedGenre}` : ""}`}
          </p>
        )}

        {/* Login prompt toast */}
        <AnimatePresence>
          {loginPromptVisible && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/25 text-sm"
            >
              <LogIn
                className="w-4 h-4 flex-shrink-0"
                style={{ color: "oklch(var(--coral))" }}
              />
              <span className="text-foreground">
                Please{" "}
                <button
                  type="button"
                  onClick={login}
                  className="underline font-semibold"
                  style={{ color: "oklch(var(--coral))" }}
                >
                  log in
                </button>{" "}
                to like songs
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        {isLoading && <SongsLoadingGrid />}

        {/* Song grid */}
        {!isLoading && filteredSongs.length > 0 && (
          <motion.div
            data-ocid="songs.list"
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredSongs.map((song, idx) => (
                <SongCard
                  key={song.id.toString()}
                  song={song}
                  index={idx + 1}
                  currentPrincipal={currentPrincipal}
                  isAuthenticated={isAuthenticated}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  isLiking={likeMutation.isPending}
                  isDeleting={deleteMutation.isPending}
                  onLoginRequired={handleLoginRequired}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty state */}
        {!isLoading && filteredSongs.length === 0 && (
          <motion.div
            data-ocid="songs.empty_state"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="relative mb-6">
              {/* Concentric rings */}
              <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-primary/10 animate-pulse-ring" />
              <div className="absolute -inset-3 w-30 h-30 rounded-full border border-primary/5 animate-pulse-ring [animation-delay:0.5s]" />
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Music4
                  className="w-9 h-9"
                  style={{ color: "oklch(var(--coral))" }}
                />
              </div>
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">
              {selectedGenre ? `No ${selectedGenre} songs yet` : "No songs yet"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              {selectedGenre
                ? `Be the first to share a ${selectedGenre} track with the community.`
                : "Be the first to share a song. Your taste could inspire someone's next favourite discovery."}
            </p>
            {isAuthenticated ? (
              <Button
                onClick={() => setIsShareOpen(true)}
                data-ocid="songs.share_button"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                Share the First Song
              </Button>
            ) : (
              <Button
                onClick={login}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <LogIn className="w-4 h-4" />
                Login to Share
              </Button>
            )}
          </motion.div>
        )}
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Disc3
              className="w-4 h-4"
              style={{ color: "oklch(var(--coral))" }}
            />
            <span className="font-display font-semibold text-foreground/70">
              SongShare
            </span>
          </div>
          <p>
            © {new Date().getFullYear()}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline underline-offset-2"
              style={{ color: "oklch(var(--coral))" }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* ── Share Modal ────────────────────────────────────── */}
      <ShareSongModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onSubmit={handleShare}
        isSubmitting={submitMutation.isPending}
      />

      {/* Scroll indicator */}
      {filteredSongs.length > 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground flex flex-col items-center gap-1 pointer-events-none"
          aria-hidden="true"
        >
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      )}
    </div>
  );
}
