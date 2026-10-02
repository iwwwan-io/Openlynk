"use client";

import { useEffect, useState } from "react";
import { GitFork, Users, ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/social-icons";
import type { BentoSize } from "@/lib/types";

type GitHubProfile = {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  html_url: string;
};

export function GithubCard({
  username,
  size,
}: {
  username: string;
  size?: BentoSize;
}) {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://api.github.com/users/${encodeURIComponent(username)}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data: GitHubProfile) => {
        if (!cancelled) {
          setProfile(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  const profileUrl = profile?.html_url || `https://github.com/${username}`;
  const isCompact = size === "1x1";

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-border"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.name || username}
              className="h-8 w-8 rounded-full border border-border/80 object-cover shrink-0"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground shrink-0">
              <GithubIcon className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            <h4 className="font-display text-sm font-bold text-foreground leading-tight truncate">
              {profile?.name || username}
            </h4>
            <p className="font-mono text-[11px] text-muted-foreground truncate">
              @{username}
            </p>
          </div>
        </div>

        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:text-foreground shrink-0">
          <ExternalLink className="h-3 w-3" />
        </span>
      </div>

      {/* Bio / Description if not compact and present */}
      {!isCompact && profile?.bio && (
        <p className="my-1.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {profile.bio}
        </p>
      )}

      {/* Stats row */}
      <div className="mt-2 flex items-center gap-3 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1 font-medium">
          <GitFork className="h-3 w-3 text-muted-foreground shrink-0" />
          <span>{loading ? "..." : (profile?.public_repos ?? 0)}</span>
          <span className="hidden sm:inline text-[10px]">repos</span>
        </div>
        <div className="flex items-center gap-1 font-medium">
          <Users className="h-3 w-3 text-muted-foreground shrink-0" />
          <span>{loading ? "..." : (profile?.followers ?? 0)}</span>
          <span className="hidden sm:inline text-[10px]">followers</span>
        </div>
      </div>
    </a>
  );
}
