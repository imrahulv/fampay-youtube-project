require("dotenv").config();

const envs = new Set([
  "MONGODB_URI",
  "NODE_ENV",
  "PORT",
  "YOUTUBE_API_KEY",
  "YOUTUBE_SEARCH_QUERY",
]);

const required = new Set(["MONGODB_URI", "YOUTUBE_API_KEY"]);

for (const env of envs) {
  const val = process.env[env];

  if (required.has(env) && !val) {
    console.log(`Missing required environtment variable: ${env}`);
    process.exit(1);
  }

  exports[env] = val;
}
