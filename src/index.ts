import fs from "fs/promises";
import path from "path";
import { scrape } from "./scrape";
import { BOOKS } from "./book";

export type Verse = { verse_num: number; text: string };
export type Chapter = { chapter_num: number; verses: Verse[] };
export type Book = { name: keyof typeof BOOKS; chapters: Chapter[] };

async function main() {
  await scrape("KJV").then((res) => res && WriteBible(res));
}

main();

async function WriteBible([VERSION, BIBLE]: readonly [string, Book[]]) {
  await fs.writeFile(
    path.join(process.cwd(), "translations", `${VERSION}.json`),
    JSON.stringify(BIBLE)
  );
}
