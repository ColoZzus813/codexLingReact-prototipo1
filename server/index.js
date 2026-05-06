import { app } from "./app.js";
import { env } from "./config/env.js";
import { ensureDatabase } from "./config/database.js";

await ensureDatabase();

app.listen(env.port, () => {
  console.log(`API REST running on http://localhost:${env.port}`);
});
