
import React from "react";
import samplePoems from "../utils/sample_poems.json";
import SongPlayer from "../components/SongPlayer";

export default function AlbumPage() {
  return (
    <main className="flex justify-center items-start min-h-[60vh] py-8 sm:py-12 px-2 bg-gradient-to-br from-white via-blue-50 to-cyan-100" aria-label="앨범 곡 리스트 메인 영역">
      <section className="w-full max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8 text-center text-blue-700 drop-shadow" tabIndex={0} aria-label="나의 앨범 샘플">
          나의 앨범 <span className="text-base font-normal text-blue-400">(샘플)</span>
        </h1>
        <div className="flex flex-col gap-6">
          {samplePoems.map((song, idx) => (
            <article
              key={idx}
              className="rounded-2xl shadow-xl bg-gradient-to-br from-white via-blue-50 to-cyan-50 border border-blue-100 px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-2 transition-transform duration-200 hover:scale-[1.025] hover:shadow-2xl cursor-pointer"
              tabIndex={0}
              aria-label={`곡 카드: ${song.title}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-lg text-blue-700 truncate max-w-[70%] flex items-center gap-1">
                  <svg className="w-5 h-5 text-blue-400 inline-block -mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 18V5l9-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg>
                  {song.title}
                </span>
                <span
                  className={
                    "text-xs px-3 py-1 rounded-full font-semibold shadow-sm flex items-center gap-1 " +
                    (song.style === "ballad"
                      ? "bg-gradient-to-r from-blue-200 to-blue-400 text-blue-800"
                      : "bg-gradient-to-r from-cyan-200 to-cyan-400 text-cyan-900")
                  }
                  aria-label={`곡 스타일: ${song.style === "ballad" ? "발라드" : "엔카"}`}
                >
                  <svg className="w-4 h-4 inline-block mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 18V5l9-2v13"/></svg>
                  {song.style === "ballad" ? "발라드" : "엔카"}
                </span>
              </div>
              <pre className="whitespace-pre-wrap text-gray-700 text-[1.05rem] leading-relaxed mb-1 font-sans break-words">{song.text}</pre>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                {song.date && (
                  <span className="flex items-center gap-1" aria-label={`작성일: ${song.date}`}>
                    <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    {song.date}
                  </span>
                )}
                {song.duration && (
                  <span className="flex items-center gap-1" aria-label={`길이: ${Math.floor(song.duration / 60)}분 ${(song.duration % 60).toString().padStart(2, '0')}초`}>
                    <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <SongPlayer title={song.title} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
