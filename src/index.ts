import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";

type Verse = { verse_num: number; text: string };
type Chapter = { chapter_num: number; verses: Verse[] };
type Book = { name: string; chapters: Chapter[] };

const BIBLE: Book[] = [];
const VERSION = "KJV";

async function main(url: URL) {
  const query = url.searchParams.get("search")!.split(" ");
  const chapter: Chapter = { chapter_num: parseInt(query.pop()!), verses: [] };
  const book_name = query.join(" ");

  console.log(book_name, chapter.chapter_num);

  const book = BIBLE.find((book) => book.name === book_name);
  if (book) {
    book.chapters.push(chapter);
  } else {
    BIBLE.push({ name: book_name, chapters: [chapter] });
  }

  const { data: raw_html } = await axios.get(url.toString());
  const $ = cheerio.load(raw_html);

  const passage_paragraphs = $("div .passage-content").children("div").children("p");

  for (let x = 0; x < passage_paragraphs.length; x++) {
    const p = passage_paragraphs[x].lastChild! as cheerio.Element;
    const _verse = p.children.at(-1);
    const verse = $(_verse).text();
    chapter.verses.push({ verse_num: x + 1, text: verse });
  }

  const next_chapter_link = $("div .prev-next").children()[1].attribs["href"];

  if (next_chapter_link) {
    return main(new URL(url.origin + next_chapter_link));
  }
}

const start_url = new URL(
  "https://www.biblegateway.com/passage/?search=Genesis%201&version=" + VERSION
);
main(start_url).then(async () => {
  await fs.writeFile(
    path.join(process.cwd(), "translations", `${VERSION}.json`),
    JSON.stringify(BIBLE)
  );
});
