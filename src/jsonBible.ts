import { Book, Chapter } from "./index";
import { BOOKS } from "./book";

const search_url = "https://jsonbible.com/search/verses.php?json=";

export async function jsonBibleFetch(translation: string) {
  const BIBLE: Book[] = [];

  for (const current_book in BOOKS) {
    const book: Book = { name: current_book as keyof typeof BOOKS, chapters: [] };
    for (
      let chapter_num = 1;
      chapter_num <= BOOKS[current_book as keyof typeof BOOKS];
      chapter_num++
    ) {
      const chapter: Chapter = { chapter_num, verses: [] };

      const search_data = {
        book: current_book,
        chapter: chapter_num,
        version: translation,
        verse: "",
      };

      console.log(search_data.book, search_data.chapter);

      // get the verse range for this chapter
      const res_ = await fetch(search_url + encodeURIComponent(JSON.stringify(search_data))).catch(
        (e) => {
          console.error(e);
          console.log(
            "Failed to get verse data",
            "Retrying: reverting index...",
            "chapter:",
            chapter_num
          );
          chapter_num--;
          return null;
        }
      );

      if (!res_) {
        continue;
      } else {
        const data: { verses: string } | null = await res_.json().catch((e) => {
          console.error(e);
          console.log(
            "Failed to parse verse data",
            "Retrying: reverting index...",
            "chapter:",
            chapter_num
          );
          chapter_num--;
          return null;
        });

        if (!data || !data.verses) {
          continue;
        } else {
          console.log(data.verses);
          const max_verse = parseInt(data.verses.split("-")[1]);

          // iterate over the verses
          for (let verse_num = 1; verse_num <= max_verse; verse_num++) {
            search_data.verse = verse_num.toString();
            const res = await fetch(
              search_url + encodeURIComponent(JSON.stringify(search_data))
            ).catch((e) => {
              console.error(e);
              console.log(
                "Failed to get verse text",
                "Retrying: reverting index...",
                "verse:",
                verse_num
              );
              verse_num--;
              return null;
            });

            if (!res) {
              continue;
            } else {
              const verse: { text: string } | null = await res.json().catch((e) => {
                console.error(e);
                console.log(
                  "Failed to parse verse text",
                  "Retrying: reverting index...",
                  "verse:",
                  verse_num
                );
                verse_num--;
                return null;
              });

              if (!verse || !verse.text) {
                continue;
              } else {
                chapter.verses.push({ verse_num, text: verse.text });
              }
            }
          }
        }

        book.chapters.push(chapter);
      }
    }

    switch (book.name) {
      case "Haggai":
      case "Philemon":
      case "Psalms": {
        sleep(60_000);
      }
    }
    BIBLE.push(book);
  }
  return [translation, BIBLE] as const;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
