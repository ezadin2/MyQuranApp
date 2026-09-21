"use client";
import { useQuranPlayer } from "@/client/verse/hooks/use-quran-player";
import { useTafseer } from "@/client/verse/hooks/use-tafseer";
import QuranPlayer from "@/components/quran-player";
import TafseerModel from "@/components/tafseer-model";
import useUpdateSearchParams from "@/hooks/use-update-search-params";
import { useEffect } from "react";

export default function ModelProvider() {
  const quranPlayerModel = useQuranPlayer();
  const tafseer = useTafseer();

  const { updateSearchParams } = useUpdateSearchParams();

  useEffect(() => {
    const { isOpen, chapterId, verseId } = quranPlayerModel;
    if (isOpen && verseId && chapterId) {
      updateSearchParams({ verse: verseId, chapter: chapterId }, { scroll: false });
    }
  }, [updateSearchParams, quranPlayerModel]);

  return (
    <>
      {quranPlayerModel.isOpen && <QuranPlayer />}
      {tafseer.isOpen && (
        <TafseerModel
          tafseerId={tafseer.tafseerId}
          chapterId={tafseer.chapterId}
          verseId={tafseer.verseId}
          handleOpenChange={() => tafseer.onClose()}
        />
      )}
    </>
  );
}
