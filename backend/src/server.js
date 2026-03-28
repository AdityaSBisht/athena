import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  console.log(`Financial Truth Engine backend running on http://localhost:${env.port}`);
});
