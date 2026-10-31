"use client";

import { useEffect, useState } from "react";
import type { RepoRef } from "@/lib/domain";
import { rawFileUrl } from "@/lib/github/url";

const cache = new Map<string, Promise<string>>();

/** Full file text from raw.githubusercontent.com at the pinned commit (CORS-enabled, cached per session). */
function loadFile(url: string): Promise<string> {
  let pending = cache.get(url);
  if (!pending) {
    pending = fetch(url).then((response) => {
      if (!response.ok) throw new Error(String(response.status));
      return response.text();
    });
    pending.catch(() => cache.delete(url));
    cache.set(url, pending);
  }
  return pending;
}

export type FileState = { status: "loading" } | { status: "ready"; content: string } | { status: "error" };

export function useFile(repo: RepoRef, path: string | undefined): FileState {
  const url = path ? rawFileUrl(repo, path) : "";
  const [result, setResult] = useState<{ url: string; state: FileState }>();

  useEffect(() => {
    if (!url) return;
    let alive = true;
    loadFile(url)
      .then((content) => alive && setResult({ url, state: { status: "ready", content } }))
      .catch(() => alive && setResult({ url, state: { status: "error" } }));
    return () => {
      alive = false;
    };
  }, [url]);

  return result?.url === url ? result.state : { status: "loading" };
}
