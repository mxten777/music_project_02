import React, { useState } from "react";
import PoemInputForm from "../components/PoemInputForm";

export default function HomePage() {
  const [submitted, setSubmitted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handlePoemSubmit = async ({ poem, style }) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    setSubmitted(null);
    try {
      // 실제 API 연동 시 await fetch/post 등 사용
      await new Promise((res) => setTimeout(res, 1500)); // 테스트용 딜레이
      setSubmitted({ poem, style });
      setSuccess(true);
    } catch (e) {
      setError("곡 생성 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="flex justify-center items-start min-h-[60vh] py-8 sm:py-12 px-2 bg-gradient-to-br from-blue-100 via-white to-cyan-100"
      aria-label="시 입력 및 곡 생성 메인 영역"
    >
      <section className="w-full max-w-lg sm:max-w-xl md:max-w-2xl">
        <h1
          className="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8 text-center text-blue-700 drop-shadow"
          tabIndex={0}
          aria-label="나만의 시로 곡 만들기"
        >
          나만의 시로 곡 만들기
        </h1>
        <div className="rounded-3xl shadow-2xl bg-white/90 border border-blue-100 px-4 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 mb-4 flex flex-col gap-6">
          <PoemInputForm onSubmit={handlePoemSubmit} />
          {loading && (
            <div
              className="mt-6 flex items-center gap-2 text-blue-600 animate-pulse justify-center"
              role="status"
              aria-live="polite"
            >
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              곡을 생성 중입니다...
            </div>
          )}
          {error && (
            <div
              className="mt-6 p-4 border rounded-xl bg-red-100 text-red-700 font-semibold shadow text-center"
              role="alert"
            >
              {error}
            </div>
          )}
          {success && submitted && (
            <div
              className="mt-6 p-4 border rounded-xl bg-gradient-to-r from-green-50 to-blue-50 shadow text-center"
              aria-live="polite"
            >
              <h2 className="font-bold mb-2 text-blue-700" tabIndex={0}>
                입력한 시
              </h2>
              <pre className="whitespace-pre-wrap text-gray-800 mb-2 text-base">
                {submitted.poem}
              </pre>
              <div>
                선택한 스타일:{" "}
                <b className="text-blue-600">
                  {submitted.style === "ballad" ? "발라드" : "엔카"}
                </b>
              </div>
              <div className="mt-4 text-sm text-green-700 font-semibold">
                곡 생성이 완료되었습니다! (실제 곡 생성은 추후 구현)
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}