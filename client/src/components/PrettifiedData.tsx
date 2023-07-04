"use client";
import { Avatar } from "@mantine/core";
import {
  IconError404,
  IconExclamationCircle,
  IconClipboardCheck,
  IconClipboard,
} from "@tabler/icons-react";
import Linkify from "linkify-react";
import Highlighter from "react-highlight-words";
import { useUiStore } from "../../lib/store";
import { BtnRegenerateRes } from "./BtnRegenerateRes";

interface PrettifiedDataProps {
  data: Data;
  onBtnEvent: () => any;
  id: number;
}

interface Data {
  content: string;
  originalQuery: string;
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

export const PrettifiedData: React.FC<PrettifiedDataProps> = ({
  data,
  onBtnEvent,
  id,
}) => {
  const { newData, areDataCopied, setAreDataCopied } = useUiStore();
  const { content, originalQuery } = data;
  if (!content) {
    return "";
  }
  if (
    !content?.includes("Secondo la documentazione") &&
    !content?.includes("The documentation says")
  )
    return (
      <div
        className="prettified-data"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: "5px",
        }}
      >
        {data?.content?.includes("No matches found for your query") ? (
          <IconError404 size={60} />
        ) : (
          <IconExclamationCircle size={60} />
        )}
        <p>{data?.content}</p>
      </div>
    );
  const parsedData = content?.replaceAll("<em>", "").replaceAll("</em>", "");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div
        style={{
          display: "flex",
          gap: "10px",
          //maxHeight: "80%",
          overflowY: "auto",
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
          <div
            className="header"
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <h2>{content?.slice(0, content?.indexOf(":"))}</h2>
            {!newData && data ? (
              areDataCopied ? (
                <IconClipboardCheck />
              ) : (
                <IconClipboard
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(content);
                    setAreDataCopied(true);
                  }}
                />
              )
            ) : (
              ""
            )}
          </div>
          <Highlighter
            highlightClassName="YourHighlightClass"
            textToHighlight={parsedData.slice(parsedData.indexOf(":") + 1)}
            searchWords={["http", "@", "www"]}
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
      {!newData && data && <BtnRegenerateRes onBtnEvent={onBtnEvent} id={id} />}
    </div>
  );
};
