import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExternalLink, Heart, Music2, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import type { Song } from "../backend.d";

const GENRE_COLORS: Record<string, string> = {
  Pop: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Rock: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Hip-Hop": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Jazz: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Electronic: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  Classical: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "R&B": "bg-rose-500/20 text-rose-300 border-rose-500/30",
  Country: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Other: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

function getGenreColor(genre: string): string {
  return (
    GENRE_COLORS[genre] ?? "bg-slate-500/20 text-slate-300 border-slate-500/30"
  );
}

interface SongCardProps {
  song: Song;
  index: number;
  currentPrincipal?: string;
  isAuthenticated: boolean;
  onLike: (id: bigint) => void;
  onDelete: (id: bigint) => void;
  isLiking: boolean;
  isDeleting: boolean;
  onLoginRequired: () => void;
}

export function SongCard({
  song,
  index,
  currentPrincipal,
  isAuthenticated,
  onLike,
  onDelete,
  isLiking,
  isDeleting,
  onLoginRequired,
}: SongCardProps) {
  const isOwner =
    currentPrincipal && song.submittedBy.toString() === currentPrincipal;

  const handleLike = () => {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }
    onLike(song.id);
  };

  const timeAgo = () => {
    const now = Date.now();
    const ts = Number(song.timestamp) / 1_000_000; // nanoseconds to ms
    const diff = now - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <motion.div
      data-ocid={`songs.item.${index}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-card hover:border-primary/30 hover:shadow-glow transition-colors duration-200"
    >
      {/* Decorative vinyl ring */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full border-2 border-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full border border-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex flex-col flex-1 p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/15 transition-colors">
              <Music2
                className="w-5 h-5 text-coral"
                style={{ color: "oklch(var(--coral))" }}
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-semibold text-foreground text-sm sm:text-base leading-tight truncate max-w-[180px] sm:max-w-[220px]">
                {song.title}
              </h3>
              <p className="text-muted-foreground text-xs truncate mt-0.5">
                {song.artist}
              </p>
            </div>
          </div>
          <Badge
            className={cn(
              "flex-shrink-0 text-xs border font-medium px-2 py-0.5",
              getGenreColor(song.genre),
            )}
          >
            {song.genre}
          </Badge>
        </div>

        {/* Description */}
        {song.description && (
          <p className="text-muted-foreground text-xs leading-relaxed mb-3 line-clamp-2">
            {song.description}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border">
          <span className="text-muted-foreground text-xs">{timeAgo()}</span>

          <div className="flex items-center gap-1.5">
            {/* Like button */}
            <button
              type="button"
              data-ocid={`songs.like_button.${index}`}
              onClick={handleLike}
              disabled={isLiking}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-coral hover:bg-primary/10 transition-all duration-150 disabled:opacity-50"
              aria-label={`Like ${song.title}`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>{song.likes.toString()}</span>
            </button>

            {/* Listen button */}
            <a
              href={song.link}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid={`songs.listen_button.${index}`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-primary/15 text-coral hover:bg-primary/25 border border-primary/20 hover:border-primary/40 transition-all duration-150"
              aria-label={`Listen to ${song.title}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Listen</span>
            </a>

            {/* Delete button (owner only) */}
            {isOwner && (
              <button
                type="button"
                data-ocid={`songs.delete_button.${index}`}
                onClick={() => onDelete(song.id)}
                disabled={isDeleting}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150 disabled:opacity-50"
                aria-label={`Delete ${song.title}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
