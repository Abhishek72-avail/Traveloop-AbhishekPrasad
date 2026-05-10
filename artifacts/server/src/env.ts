import path from "path";

// Load .env from root
try {
  process.loadEnvFile(path.join(import.meta.dirname, "../../../.env"));
} catch (e) {
  // Ignore
}
