import axios from "axios";
import * as cheerio from "cheerio";
import type { BibleScraperFn, Book, Chapter } from "./index";

const BIBLE: Book[] = [];

const main: BibleScraperFn = async ([VERSION, url]) => {
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

  const passage_container = $("div .passage-content").children("div").children("div")[0];
  const passage_list = $(passage_container).children("div, p");
  console.log(passage_list.length);

  // p -> span -> text?
  // div -> p -> span -> text?

  // for (let x = 0; x < passage_paragraphs.length; x++) {
  //   const p = passage_paragraphs[x].lastChild! as cheerio.Element;
  //   const _verse = p.children.at(-1);
  //   const verse = $(_verse).text();
  //   chapter.verses.push({ verse_num: x + 1, text: verse });
  // }

  const chapter_links_count = $("div .prev-next").children("a").length;
  const next_chapter_link =
    $("div .prev-next").children("a")[chapter_links_count - 1].attribs["href"];

  if (next_chapter_link) {
    return main([VERSION, new URL(url.origin + next_chapter_link)]);
  } else {
    return [VERSION, BIBLE];
  }
};

export default main;
