import * as fs from "fs/promises";
import * as path from "path";

async function read() {
  const _bible = await fs.readFile(path.join(process.cwd(), "translations/KJV.json"), "utf8");
  const bible = JSON.parse(_bible);
  console.log(bible);
}

read();
