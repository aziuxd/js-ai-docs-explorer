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
import { useState } from "react";

interface PrettifiedDataProps {
  data: Data;
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

export const PrettifiedData: React.FC<PrettifiedDataProps> = ({ data }) => {
  const { newData } = useUiStore();
  const [areDataCopied, setAreDataCopied] = useState<boolean>(false);
  try {
    const { content, originalQuery } = data;
    console.log(originalQuery);
    if (!content || content === "" || Object.is({}, data)) {
      return "";
    }
    if (
      !content?.includes("Secondo la documentazione") &&
      !content?.includes("The documentation says")
    )
      return (
        <>
          <UserQuery query={originalQuery} />
          <div
            style={{
              display: "flex",
              gap: "10px",
              //maxHeight: "80%",
              overflowY: "auto",
            }}
          >
            <Avatar color="blue" />
            <div
              className="prettified-data"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderRadius: "5px",
                width: "100%",
              }}
            >
              {data?.content?.includes("No matches found for your query") ? (
                <IconError404 size={60} />
              ) : (
                <IconExclamationCircle size={60} />
              )}
              <p>{data?.content}</p>
            </div>
          </div>
        </>
      );
    let parsedData = content?.replaceAll("<em>", "").replaceAll("</em>", "");
    console.log(JSON.stringify(parsedData));
    parsedData = parsedData.replaceAll("\n", "\\n");
    /*.replace(content[content.indexOf("1") - 1], "\n")
    .replace(content[content.indexOf("2") - 1], "\n")
    .replace(content[content.indexOf("3") - 1], "\n")
    .replace(content[content.indexOf("4") - 1], "\n")
    .replace(content[content.indexOf("5") - 1], "\n")
    .replace(content[content.indexOf("6") - 1], "\n")
    .replace(content[content.indexOf("7") - 1], "\n")
    .replace(content[content.indexOf("8") - 1], "\n")
    .replace(content[content.indexOf("9") - 1], "\n");*/

    return (
      <>
        <UserQuery query={originalQuery} />
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              gap: "10px",
              //maxHeight: "80%",
              overflowY: "auto",
            }}
          >
            <Avatar color="blue" />
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
                    <IconClipboardCheck
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        navigator.clipboard.writeText(content);
                        setAreDataCopied(true);
                      }}
                    />
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
        </div>
      </>
    );
  } catch (err) {
    return "";
  }
};

const UserQuery = ({ query }: { query: string }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        overflowY: "auto",
        justifyContent: "flex-end",
      }}
    >
      <div
        className="prettified-data"
        id="user-query"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          borderRadius: "5px",
          backgroundColor: "#4dabf7 !important",
          width: "fit-content",
          justifyContent: "flex-end",
          alignItems: "flex-end",
        }}
      >
        <h2>Your query</h2>
        <p>{query}</p>
      </div>
      <Avatar color="teal" />
    </div>
  );
};
