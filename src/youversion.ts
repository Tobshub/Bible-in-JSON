import * as cheerio from "cheerio";
import { Book, Chapter, ReadBible, WriteBible } from ".";
import { BOOKS } from "./book";

const TPT_BOOKS_MAP: Record<string, keyof typeof BOOKS> = {
  GEN: "Genesis",
  JOS: "Joshua",
  JDG: "Judges",
  RUT: "Ruth",
  PSA: "Psalms",
  PRO: "Proverbs",
  SNG: "Song of Solomon",
  ISA: "Isaiah",
  JER: "Jeremiah",
  LAM: "Lamentations",
  EZK: "Ezekiel",
  DAN: "Daniel",
  MAT: "Matthew",
  MRK: "Mark",
  LUK: "Luke",
  JHN: "John",
  ACT: "Acts",
  ROM: "Romans",
  "1CO": "1 Corinthians",
  "2CO": "2 Corinthians",
  GAL: "Galatians",
  EPH: "Ephesians",
  PHP: "Philippians",
  COL: "Colossians",
  "1TH": "1 Thessalonians",
  "2TH": "2 Thessalonians",
  "1TI": "1 Timothy",
  "2TI": "2 Timothy",
  TIT: "Titus",
  PHM: "Philemon",
  HEB: "Hebrews",
  JAS: "James",
  "1PE": "1 Peter",
  "2PE": "2 Peter",
  "1JN": "1 John",
  "2JN": "2 John",
  "3JN": "3 John",
  JUD: "Jude",
  REV: "Revelation",
};

function formatVerseUrl(book: keyof typeof TPT_BOOKS_MAP, chapter: number, verse: number) {
  const youversion_url = "https://www.bible.com/bible/1849";
  return `${youversion_url}/${book}.${chapter}.${verse}.TPT`;
}

async function fetchVersePage(book: keyof typeof TPT_BOOKS_MAP, chapter: number, verse: number) {
  const url = formatVerseUrl(book, chapter, verse);
  const res = await fetch(url)
    .then((r) => r.text())
    .catch((e) => {
      console.error("Failed to get verse page", e);
    });
  return res;
}

export async function youversionFetch() {
	await WriteBible(["TPT", []]);

  for (const current_book in TPT_BOOKS_MAP) {
    const mapped_book_name = TPT_BOOKS_MAP[current_book as keyof typeof TPT_BOOKS_MAP];
    const book: Book = { name: mapped_book_name, chapters: [] };

    for (let chapter_num = 1; chapter_num <= BOOKS[mapped_book_name]; chapter_num++) {
      console.log(current_book, chapter_num);
      const chapter: Chapter = { chapter_num, verses: [] };

      for (let verse_num = 1; verse_num <= 200; verse_num++) {
        const versePage = await fetchVersePage(current_book, chapter_num, verse_num);
        if (!versePage) {
          console.log("Failed to get verse page", mapped_book_name, chapter_num, verse_num);
          return;
        }
        const $ = cheerio.load(versePage);
        const verse_text = $("p.leading-default").text();
        if (!verse_text) {
          const not_found_text = $("p.text-center").text();
          if (not_found_text.toLowerCase() === "no available verses") {
            break;
          }
          console.log("Failed to get verse text", mapped_book_name, chapter_num, verse_num);
          return;
        }

        chapter.verses.push({ verse_num, text: verse_text });
      }

      book.chapters.push(chapter);
    }

    const bible = await ReadBible("TPT");
		bible.push(book);
		await WriteBible(["TPT", bible]);
		console.log("SAVED BOOK", mapped_book_name);
  }
}
