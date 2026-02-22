import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const envFilePath = path.join(root, ".env");

function parseDotEnv(text) {
  const result = {};
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      result[key] = value;
    }
  }

  return result;
}

if (fs.existsSync(envFilePath)) {
  const parsed = parseDotEnv(fs.readFileSync(envFilePath, "utf8"));
  for (const [key, value] of Object.entries(parsed)) {
    // Keep shell-provided env vars as highest priority.
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_ANON_KEY"];
const missing = requiredEnvVars.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const configContent = `window.TV_TRACKER_CONFIG = {\n  supabaseUrl: ${JSON.stringify(
  process.env.SUPABASE_URL,
)},\n  supabaseAnonKey: ${JSON.stringify(process.env.SUPABASE_ANON_KEY)},\n};\n`;

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

const staticFiles = ["index.html", "sessions.html", "styles.css", "app.js"];
for (const file of staticFiles) {
  fs.copyFileSync(path.join(root, file), path.join(distDir, file));
}

fs.writeFileSync(path.join(distDir, "config.js"), configContent, "utf8");

console.log("Build complete. Generated dist/config.js from environment variables.");
