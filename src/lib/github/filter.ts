import { LIMITS } from "@/lib/config";
import type { FileInfo } from "@/lib/domain";

const IGNORED_DIRS = new Set([
  "node_modules", ".git", "dist", "build", "out", ".next", ".nuxt", ".svelte-kit", ".turbo",
  ".vercel", ".output", "coverage", "vendor", "__pycache__", ".venv", "venv", ".tox", "target",
  "bin", "obj", ".idea", ".vscode", "Pods", "DerivedData", ".gradle", ".dart_tool", ".expo",
  ".cache", ".parcel-cache", "storybook-static",
]);

const IGNORED_FILES = new Set([
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb", "bun.lock", "Cargo.lock",
  "poetry.lock", "uv.lock", "Gemfile.lock", "composer.lock", "go.sum", "Podfile.lock",
  "pubspec.lock", ".DS_Store", "Thumbs.db",
]);

const BINARY_EXTENSIONS = new Set([
  "png", "jpg", "jpeg", "gif", "webp", "avif", "ico", "bmp", "tiff", "psd", "ai", "sketch", "fig",
  "pdf", "zip", "gz", "tgz", "tar", "rar", "7z", "mp4", "mov", "webm", "avi", "mp3", "wav", "ogg",
  "flac", "woff", "woff2", "ttf", "otf", "eot", "exe", "dll", "so", "dylib", "class", "jar", "pyc",
  "pyo", "db", "sqlite", "sqlite3", "bin", "dat", "wasm", "lockb", "keystore", "jks", "p12", "pem",
]);

function extensionOf(path: string): string {
  const name = path.slice(path.lastIndexOf("/") + 1);
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

/** True for files worth reading as source: not dependencies, build output, lockfiles, binaries or huge files. */
export function isReadableSource(file: FileInfo): boolean {
  const segments = file.path.split("/");
  const name = segments[segments.length - 1];
  if (segments.slice(0, -1).some((dir) => IGNORED_DIRS.has(dir))) return false;
  if (IGNORED_FILES.has(name)) return false;
  if (/\.min\.(js|css)$/i.test(name) || name.endsWith(".map")) return false;
  if (BINARY_EXTENSIONS.has(extensionOf(name))) return false;
  if (file.size === 0 || file.size > LIMITS.maxFileBytes) return false;
  return true;
}

/** Keeps files inside `subdir` (paths stay repo-relative so citations and GitHub links still work). */
export function withinSubdir(files: FileInfo[], subdir: string): FileInfo[] {
  if (!subdir) return files;
  const prefix = subdir.endsWith("/") ? subdir : `${subdir}/`;
  return files.filter((file) => file.path.startsWith(prefix));
}

export function findReadme(files: FileInfo[], subdir: string): FileInfo | undefined {
  const isReadme = (path: string, dir: string) => {
    const rest = dir ? path.slice(dir.length + 1) : path;
    return path.startsWith(dir ? `${dir}/` : "") && /^readme(\.(md|markdown|rst|txt))?$/i.test(rest);
  };
  return files.find((file) => isReadme(file.path, subdir)) ?? files.find((file) => isReadme(file.path, ""));
}

/** Keeps the given order and stops once the file-count or byte budget would be exceeded. */
export function selectWithinBudget(
  paths: string[],
  sizes: Map<string, number>,
  budget: { files: number; bytes: number } = { files: LIMITS.maxPartFiles, bytes: LIMITS.maxPartBytes },
): string[] {
  const chosen: string[] = [];
  let bytes = 0;
  for (const path of new Set(paths)) {
    const size = sizes.get(path);
    if (size === undefined) continue;
    if (chosen.length >= budget.files) break;
    if (bytes + size > budget.bytes) continue;
    chosen.push(path);
    bytes += size;
  }
  return chosen;
}

const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  ts: "typescript", tsx: "tsx", js: "javascript", jsx: "jsx", mjs: "javascript", cjs: "javascript",
  py: "python", rb: "ruby", go: "go", rs: "rust", java: "java", kt: "kotlin", swift: "swift",
  c: "c", h: "c", cpp: "cpp", hpp: "cpp", cc: "cpp", cs: "csharp", php: "php", dart: "dart",
  vue: "vue", svelte: "svelte", astro: "astro", html: "html", css: "css", scss: "scss",
  json: "json", yml: "yaml", yaml: "yaml", toml: "toml", md: "markdown", mdx: "mdx", sql: "sql",
  sh: "bash", zsh: "bash", graphql: "graphql", prisma: "prisma", lua: "lua", r: "r",
};

/** Shiki language id for a path, or "text" when unknown. */
export function languageFromPath(path: string): string {
  const name = path.slice(path.lastIndexOf("/") + 1);
  if (name === "Dockerfile") return "docker";
  if (name === "Makefile") return "make";
  return LANGUAGE_BY_EXTENSION[extensionOf(name)] ?? "text";
}
