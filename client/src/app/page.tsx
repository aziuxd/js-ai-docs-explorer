"use client";
import { useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [queryData, setQueryData] = useState<string>("");
  return (
    <main>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await fetch(
            `http://127.0.0.1:8000/api/AskChatGPT/${searchQuery}`
          );
          const data = await res.json();

          setQueryData(data);
        }}
      >
        <label htmlFor="search-query">Search query</label>
        <input
          type="text"
          minLength={3}
          id="search-query"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>
      <div>{queryData}</div>
    </main>
  );
}
