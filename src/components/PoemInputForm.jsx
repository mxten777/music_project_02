import React, { useState } from "react";

export default function PoemInputForm({ onSubmit }) {
  const [poem, setPoem] = useState("");
  const [style, setStyle] = useState("ballad");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!poem.trim()) return;
    onSubmit?.({ poem, style });
    setPoem("");
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit} aria-label="시 입력 폼" role="form">
      <label htmlFor="poem-textarea" className="block font-semibold text-blue-700 text-base sm:text-lg mb-1">시 입력</label>
      <textarea
        id="poem-textarea"
        className="w-full px-4 py-3 border border-blue-200 rounded-xl resize-y min-h-[120px] bg-blue-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm text-base sm:text-lg"
        placeholder="여기에 시를 입력하세요"
        value={poem}
        onChange={(e) => setPoem(e.target.value)}
        required
        aria-label="시 입력란"
      />
      <fieldset className="flex gap-4 sm:gap-6 items-center" aria-label="곡 스타일 선택">
        <legend className="sr-only">곡 스타일</legend>
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-blue-700">
          <input
            type="radio"
            name="style"
            value="ballad"
            checked={style === "ballad"}
            onChange={() => setStyle("ballad")}
            className="accent-blue-600 w-4 h-4"
            aria-checked={style === "ballad"}
            aria-label="발라드 스타일 선택"
          />
          <span className="px-2 py-1 rounded-full bg-blue-100">발라드</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-cyan-700">
          <input
            type="radio"
            name="style"
            value="enka"
            checked={style === "enka"}
            onChange={() => setStyle("enka")}
            className="accent-cyan-600 w-4 h-4"
            aria-checked={style === "enka"}
            aria-label="엔카 스타일 선택"
          />
          <span className="px-2 py-1 rounded-full bg-cyan-100">엔카</span>
        </label>
      </fieldset>
      <button
        type="submit"
        className="w-full rounded-xl px-6 py-3 text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-md transition-all hover:from-blue-700 hover:to-cyan-500 hover:shadow-xl active:scale-95"
        aria-label="곡 생성하기"
      >
        🎵 곡 생성하기
      </button>
    </form>
  );
}
