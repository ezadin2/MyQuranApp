import { OROMO_QURAN_API_URL, QURAN_JSON_API_URL } from "@/constants";
import { Chapter } from "@/types";

type OromoChapterResponse = {
  chapter: { chapter: number; verse: number; text: string }[];
};

export async function fetchOromoChapter(id: string): Promise<Chapter> {
  const [baseRes, omRes] = await Promise.all([
    fetch(`${QURAN_JSON_API_URL}/chapters/en/${id}.json`),
    fetch(`${OROMO_QURAN_API_URL}/${id}.json`),
  ]);

  if (!baseRes.ok) {
    throw new Error(`Failed to fetch chapter ${id}`);
  }

  if (!omRes.ok) {
    throw new Error(`Failed to fetch Oromo translation for chapter ${id}`);
  }

  const base = (await baseRes.json()) as Chapter;
  const om = (await omRes.json()) as OromoChapterResponse;
  const omMap = new Map(om.chapter.map((verse) => [verse.verse, verse.text]));

  return {
    ...base,
    verses: base.verses.map((verse) => ({
      ...verse,
      translation: omMap.get(verse.id) ?? verse.translation,
    })),
  };
}

export async function fetchOromoVerseTranslation(chapterId: number, verseId: number): Promise<string | undefined> {
  const res = await fetch(`${OROMO_QURAN_API_URL}/${chapterId}.json`);

  if (!res.ok) {
    return undefined;
  }

  const om = (await res.json()) as OromoChapterResponse;
  return om.chapter.find((verse) => verse.verse === verseId)?.text;
}
