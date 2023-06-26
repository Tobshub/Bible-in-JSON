import fs from "fs/promises";
import path from "path";
import KJV from "./kjv";
import NIV from "./niv";

export type Verse = { verse_num: number; text: string };
export type Chapter = { chapter_num: number; verses: Verse[] };
export type Book = { name: string; chapters: Chapter[] };

export type BibleScraperFn = (arg: readonly [string, URL]) => Promise<[string, Book[]]>;

const start_url = (VERSION: string) =>
  [
    VERSION,
    new URL("https://www.biblegateway.com/passage/?search=Genesis%201&version=" + VERSION),
  ] as const;

async function main() {
  await KJV(start_url("KJV")).then(WriteBible);
  await NIV(start_url("NIV")).then(WriteBible);
}

main();

async function WriteBible([VERSION, BIBLE]: readonly [string, Book[]]) {
  await fs.writeFile(
    path.join(process.cwd(), "translations", `${VERSION}.json`),
    JSON.stringify(BIBLE)
  );
}
