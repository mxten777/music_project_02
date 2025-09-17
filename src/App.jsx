
import React, { useState } from "react";
import HomePage from "./pages/HomePage";
import AlbumPage from "./pages/AlbumPage";
import { Header, Footer } from "./components/LayoutParts";

function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-cyan-50">
      <Header />
      <nav className="flex flex-wrap gap-2 sm:gap-4 p-4 border-b bg-white/90 shadow-sm justify-center sm:justify-start">
        <button
          className={
            "px-5 py-2 rounded-xl font-bold transition-all text-base shadow " +
            (page === "home"
              ? "bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-lg scale-105"
              : "text-blue-700 bg-white/70 hover:bg-blue-100 hover:text-blue-800")
          }
          aria-current={page === "home" ? "page" : undefined}
          onClick={() => setPage("home")}
        >
          시로 곡 만들기
        </button>
        <button
          className={
            "px-5 py-2 rounded-xl font-bold transition-all text-base shadow " +
            (page === "album"
              ? "bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-lg scale-105"
              : "text-blue-700 bg-white/70 hover:bg-blue-100 hover:text-blue-800")
          }
          aria-current={page === "album" ? "page" : undefined}
          onClick={() => setPage("album")}
        >
          나의 앨범
        </button>
      </nav>
      <main className="flex-1 px-2 sm:px-0">
        {page === "home" ? <HomePage /> : <AlbumPage />}
      </main>
      <Footer />
    </div>
  );
}

export default App;
