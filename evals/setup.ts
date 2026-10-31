import { existsSync } from "node:fs";

// Keys for the live evaluation come from .env.local, the same file `next dev` reads.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
