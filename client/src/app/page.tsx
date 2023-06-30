"use client";
import "./styles.css";
import { Textarea, Button } from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import { useRef, useState, useEffect } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [queryData, setQueryData] = useState<string>("");
  const inputRef =
    useRef<React.MutableRefObject<HTMLTextAreaElement | null>>(null);

  const onSubmit = async () => {
    try {
      if (searchQuery.length < 3)
        throw new Error("Search query should be at lest 3 chras long");
      const res = await fetch(
        `http://127.0.0.1:8000/api/AskChatGPT/${searchQuery}`
      );
      if (!res.ok) {
        throw new Error("No matches found for your query");
      }
      const data = await res.json();

      setQueryData(data);
    } catch (err) {
      setQueryData(err?.message);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef?.current?.focus();
    }
  });

  return (
    <main
      style={{
        display: "grid",
        gridTemplateColumns: "20fr 60fr 20fr",
      }}
      className="main"
    >
      <div></div>
      <div
        className="container"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          maxHeight: "100vh",
          overflowY: "auto",
          gap: "1rem",
          padding: "20px",
          paddingTop: "40px",
          backgroundColor: "gray",
          position: "relative",
        }}
      >
        <PrettifiedData data={queryData} />
        <form
          style={{
            display: "flex",
            position: "absolute",
            bottom: "10px",
            width: "95%",
            border: "2px solid red",
          }}
          id="searchQueryForm"
          name="confermationForm"
          onSubmit={async (e) => {
            e.preventDefault();
          }}
        >
          <Textarea
            ref={inputRef}
            placeholder="Search for something"
            style={{
              width: "100%",
            }}
            form="searchQueryForm"
            className="search-query"
            rightSection={<BtnSubmit onSubmit={onSubmit} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
      <div></div>
    </main>
  );
}

const BtnSubmit = ({ onSubmit }: { onSubmit: () => any }) => {
  return (
    <Button
      onClick={onSubmit}
      style={{
        margin: 0,
      }}
    >
      <IconSend size={14} />
    </Button>
  );
};

const PrettifiedData = ({ data }: { data: string }) => {
  if (
    !data.includes("Secondo la documentazione") &&
    !data.includes("The documentation says")
  )
    return <div>{data}</div>;

  return (
    <>
      <h2>{data.slice(0, data.indexOf(":"))}</h2>
      <p>{data.slice(data.indexOf(":") + 1)}</p>
    </>
  );
};
