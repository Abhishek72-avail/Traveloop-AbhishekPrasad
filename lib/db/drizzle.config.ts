import { defineConfig } from "drizzle-kit";
import path from "path";

// Load .env from root
try {
  process.loadEnvFile(path.join(__dirname, "../../.env"));
} catch (e) {
  // Ignore if file doesn't exist
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
