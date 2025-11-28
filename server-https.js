import { createServer } from "https";
import { readFileSync } from "fs";
import next from "next";

const dev = true;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(
    {
      key: readFileSync("./cert.key"),
      cert: readFileSync("./cert.crt"),
    },
    (req, res) => handle(req, res)
  ).listen(3000, () => {
    console.log("🚀 HTTPS server running at https://localhost:3000");
  });
});
