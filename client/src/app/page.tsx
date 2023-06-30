"use client";
import "./styles.css";
import { Textarea, Button, Avatar } from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import { useRef, useState, useEffect } from "react";
import Highlighter from "react-highlight-words";
import Linkify from "linkify-react";

interface CustomError {
  message?: string;
}

const findChunks = ({
  // @ts-ignore
  autoEscape,
  // @ts-ignore
  caseSensitive,
  // @ts-ignore
  sanitize,
  // @ts-ignore
  searchWords,
  // @ts-ignore
  textToHighlight,
}) => {
  // @ts-ignore
  const chunks = [];
  const textLow = textToHighlight.toLowerCase();
  const sep = /[\s]+/;

  const singleTextWords = textLow.split(sep);

  let fromIndex = 0;
  const singleTextWordsWithPos = singleTextWords.map((s: any) => {
    const indexInWord = textLow.indexOf(s, fromIndex);
    fromIndex = indexInWord;
    return {
      word: s,
      index: indexInWord,
    };
  });

  // @ts-ignore
  searchWords.forEach((sw) => {
    const swLow = sw.toLowerCase();
    // @ts-ignore
    singleTextWordsWithPos.forEach((s) => {
      if (s.word.includes(swLow)) {
        const start = s.index;
        const end = s.index + s.word.length;
        chunks.push({
          start,
          end,
        });
      }
    });
  });

  // @ts-ignore
  return chunks;
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [queryData, setQueryData] = useState<string>("");
  const inputRef = useRef(
    null
  ) as React.MutableRefObject<HTMLTextAreaElement | null>;
  const [newData, setNewData] = useState<boolean>(true);

  const onSubmit = async () => {
    setNewData(false);
    try {
      if (searchQuery.length < 3)
        throw new Error("Search query should be at lest 3 chras long");
      const res = await fetch(
        `http://127.0.0.1:8000/api/AskChatGPT/${searchQuery}`
      );
      setSearchQuery("");
      if (!res.ok) {
        throw new Error("No matches found for your query");
      }
      const data = await res.json();

      setQueryData(data);
      if (data) setNewData(true);
    } catch (err) {
      const typedErr = err as CustomError;
      setQueryData(typedErr?.message as string);
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
        //backgroundColor: "#71717a",
        backgroundColor: "#a1a1aa",
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
          //backgroundColor: "#9ca3af",
          backgroundColor: "#a1a1aa",
          position: "relative",
        }}
      >
        {queryData ? <PrettifiedData data={queryData} /> : ""}
        <CustomInput
          inputRef={inputRef}
          searchQuery={searchQuery}
          onSubmit={onSubmit}
          setSearchQuery={setSearchQuery}
          newData={newData}
        />
      </div>
      <div></div>
    </main>
  );
}

const BtnSubmit = ({
  onSubmit,
  searchQuery,
  newData,
}: {
  onSubmit: () => any;
  searchQuery: string;
  newData: boolean;
}) => {
  return (
    <Button
      onClick={onSubmit}
      className="btn-submit"
      color="#71717a "
      style={{
        display: "flex",
        width: "10%",
        height: "100%",
        backgroundColor: "#71717a !important",
        position: "absolute",
        right: "0",
        justifyContent: "flex-end",
      }}
      disabled={!searchQuery && newData}
    >
      <IconSend
        size={30}
        style={{
          //border: "2px solid yellow",
          backgroundColor: `${!searchQuery && newData ? "#71717a" : "#22d3ee"}`,
          opacity: "1",
          padding: "2px",
          borderRadius: "2px",
        }}
      />
    </Button>
  );
};

const PrettifiedData = ({ data }: { data: string }) => {
  if (
    !data.includes("Secondo la documentazione") &&
    !data.includes("The documentation says")
  )
    return <div className="prettified-data">{data}</div>;

  const parsedData = data.replaceAll("<em>", "").replaceAll("</em>", "");

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
      }}
    >
      <Avatar />
      <div
        className="prettified-data"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          borderRadius: "5px",
        }}
      >
        <h2>{data.slice(0, data.indexOf(":"))}</h2>
        <Highlighter
          highlightClassName="YourHighlightClass"
          textToHighlight={parsedData.slice(parsedData.indexOf(":") + 1)}
          searchWords={["http", "@"]}
          autoEscape={true}
          //@ts-ignore
          findChunks={findChunks}
          highlightTag={({ children, highlightIndex }) => (
            <Linkify>
              <p
                style={{
                  color: "#67e8f9",
                }}
              >
                {children}
              </p>
            </Linkify>
          )}
        />
        {/*<p>{data.slice(data.indexOf(":") + 1)}</p>*/}
      </div>
    </div>
  );
};

const CustomInput = ({
  inputRef,
  onSubmit,
  searchQuery,
  newData,
  setSearchQuery,
}: {
  inputRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  onSubmit: () => any;
  searchQuery: string;
  newData: boolean;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        bottom: "10px",
        width: "95%",
        backgroundColor: "#71717a !important",
        borderRadius: "2rem !important",
        //border: "2px solid red",
      }}
    >
      <Textarea
        ref={inputRef}
        placeholder="Search for something"
        style={{
          width: "90%",
          borderRadius: "2rem !important",
        }}
        form="searchQueryForm"
        className="search-query"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <BtnSubmit
        onSubmit={onSubmit}
        searchQuery={searchQuery}
        newData={newData}
      />
    </div>
  );
};
