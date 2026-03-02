import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, Music, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const GENRES = [
  "Pop",
  "Rock",
  "Hip-Hop",
  "Jazz",
  "Electronic",
  "Classical",
  "R&B",
  "Country",
  "Other",
];

interface ShareSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    artist: string;
    genre: string;
    link: string;
    description: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

interface FormState {
  title: string;
  artist: string;
  genre: string;
  link: string;
  description: string;
}

interface FormErrors {
  title?: string;
  artist?: string;
  genre?: string;
  link?: string;
}

export function ShareSongModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: ShareSongModalProps) {
  const [form, setForm] = useState<FormState>({
    title: "",
    artist: "",
    genre: "",
    link: "",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.artist.trim()) newErrors.artist = "Artist is required";
    if (!form.genre) newErrors.genre = "Genre is required";
    if (!form.link.trim()) {
      newErrors.link = "Link is required";
    } else {
      try {
        new URL(form.link);
      } catch {
        newErrors.link = "Must be a valid URL";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
    setForm({ title: "", artist: "", genre: "", link: "", description: "" });
    setErrors({});
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setForm({ title: "", artist: "", genre: "", link: "", description: "" });
      setErrors({});
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            data-ocid="share_form.modal"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-lg bg-card border border-border rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Accent stripe */}
            <div className="h-0.5 w-full bg-gradient-to-r from-coral via-amber to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <Music
                    className="w-4 h-4"
                    style={{ color: "oklch(var(--coral))" }}
                  />
                </div>
                <h2
                  id="modal-title"
                  className="font-display font-semibold text-lg text-foreground"
                >
                  Share a Song
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                data-ocid="share_form.close_button"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="song-title" className="text-sm font-medium">
                  Title <span className="text-coral">*</span>
                </Label>
                <Input
                  id="song-title"
                  data-ocid="share_form.title_input"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Bohemian Rhapsody"
                  className={cn(
                    "bg-secondary/50 border-border focus:border-primary/50",
                    errors.title && "border-destructive",
                  )}
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <p className="text-destructive text-xs">{errors.title}</p>
                )}
              </div>

              {/* Artist */}
              <div className="space-y-1.5">
                <Label htmlFor="song-artist" className="text-sm font-medium">
                  Artist <span className="text-coral">*</span>
                </Label>
                <Input
                  id="song-artist"
                  data-ocid="share_form.artist_input"
                  value={form.artist}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, artist: e.target.value }))
                  }
                  placeholder="e.g. Queen"
                  className={cn(
                    "bg-secondary/50 border-border focus:border-primary/50",
                    errors.artist && "border-destructive",
                  )}
                  disabled={isSubmitting}
                />
                {errors.artist && (
                  <p className="text-destructive text-xs">{errors.artist}</p>
                )}
              </div>

              {/* Genre */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Genre <span className="text-coral">*</span>
                </Label>
                <Select
                  value={form.genre}
                  onValueChange={(val) =>
                    setForm((p) => ({ ...p, genre: val }))
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    data-ocid="share_form.genre_select"
                    className={cn(
                      "bg-secondary/50 border-border focus:border-primary/50",
                      errors.genre && "border-destructive",
                    )}
                  >
                    <SelectValue placeholder="Select a genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {GENRES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.genre && (
                  <p className="text-destructive text-xs">{errors.genre}</p>
                )}
              </div>

              {/* Link */}
              <div className="space-y-1.5">
                <Label htmlFor="song-link" className="text-sm font-medium">
                  Link <span className="text-coral">*</span>
                </Label>
                <Input
                  id="song-link"
                  data-ocid="share_form.link_input"
                  type="url"
                  value={form.link}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, link: e.target.value }))
                  }
                  placeholder="https://open.spotify.com/track/..."
                  className={cn(
                    "bg-secondary/50 border-border focus:border-primary/50",
                    errors.link && "border-destructive",
                  )}
                  disabled={isSubmitting}
                />
                {errors.link && (
                  <p className="text-destructive text-xs">{errors.link}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="song-description"
                  className="text-sm font-medium"
                >
                  Description{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="song-description"
                  data-ocid="share_form.description_textarea"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Why do you love this song? What makes it special?"
                  rows={3}
                  className="bg-secondary/50 border-border focus:border-primary/50 resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  data-ocid="share_form.cancel_button"
                  className="flex-1 border-border hover:bg-secondary/80"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  data-ocid="share_form.submit_button"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    "Share Song"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
