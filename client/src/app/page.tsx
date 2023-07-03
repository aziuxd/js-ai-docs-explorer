"use client";
import "./styles.css";
import { Textarea, Button, Avatar, Loader } from "@mantine/core";
import {
  IconSend,
  IconError404,
  IconExclamationCircle,
} from "@tabler/icons-react";
import { useRef, useState, useEffect } from "react";
import Highlighter from "react-highlight-words";
import Linkify from "linkify-react";
import { useMediaQuery } from "@mantine/hooks";
import { io } from "socket.io-client";

interface CustomError {
  message?: string;
}

let socket: any;

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
  const [originalQuery, setOriginalQuery] = useState<string>(searchQuery);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async () => {
    setNewData(true);
    setOriginalQuery(searchQuery);
    setIsLoading(true);
    try {
      if (searchQuery.length < 3) {
        setIsLoading(false);
        throw new Error("Search query should be at lest 3 char long");
      }
      setQueryData("");
      socket.emit("askChatGPT", { query: searchQuery });
      setSearchQuery("");
    } catch (err) {
      const typedErr = err as CustomError;
      setQueryData(typedErr?.message as string);
    }
  };

  useEffect(() => {
    SocketHandler();

    if (inputRef.current) {
      inputRef?.current?.focus();
    }
  }, []);

  const SocketHandler = async () => {
    socket = io("http://localhost:8000", {
      forceNew: true,
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("connected!");
    });

    socket.on("askChatGPTResponse", (data: any) => {
      setIsLoading(false);
      if (data.data === "DONE") setNewData(false);
      if (data.data && data.data !== "DONE") {
        setNewData(true);
        setQueryData((prev) => prev + data.data);
      }
    });

    socket.on("err", (err: any) => {
      setIsLoading(false);
      if (err.msg === "No data") {
        setQueryData("No matches found for your query");
      } else setQueryData(err.msg);
    });
  };

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
        {isLoading ? (
          <LoadingScreen />
        ) : queryData ? (
          <PrettifiedData
            data={queryData}
            newData={newData}
            originalQuery={originalQuery}
            setQueryData={setQueryData}
            setIsLoading={setIsLoading}
          />
        ) : (
          ""
        )}
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
  const match = useMediaQuery("(max-width: 400px)");
  return (
    <Button
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
        //border: "2px solid red",
        padding: "1vw",
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        paddingRight: match ? "10px !important" : "auto",
        cursor: "auto",
      }}
      disabled={!searchQuery && newData}
    >
      <IconSend
        onClick={onSubmit}
        className="send-icon"
        size={25}
        style={{
          //border: "2px solid yellow",
          cursor: "pointer",
          backgroundColor: `${!searchQuery && newData ? "#71717a" : "#228BE6"}`,
          opacity: "1",
          padding: "0",
          borderRadius: "2px",
          //border: "2px solid yellow",
        }}
      />
    </Button>
  );
};

const PrettifiedData = ({
  data,
  newData,
  originalQuery,
  setQueryData,
  setIsLoading,
}: {
  data: string;
  newData: boolean;
  originalQuery: string;
  setQueryData: React.Dispatch<React.SetStateAction<string>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  if (
    !data?.includes("Secondo la documentazione") &&
    !data?.includes("The documentation says")
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
        {data?.includes("No matches found for your query") ? (
          <IconError404 size={60} />
        ) : (
          <IconExclamationCircle size={60} />
        )}
        <p>{data}</p>
      </div>
    );
  const parsedData = data.replaceAll("<em>", "").replaceAll("</em>", "");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div
        style={{
          display: "flex",
          gap: "10px",
          maxHeight: "80vh",
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
          <h2>{data.slice(0, data.indexOf(":"))}</h2>
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
      {!newData && data && (
        <BtnRegenerateRes
          originalQuery={originalQuery}
          setQueryData={setQueryData}
          setIsLoading={setIsLoading}
        />
      )}
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
        //borderRadius: "2rem !important",
        //border: "2px solid red",
      }}
    >
      <Textarea
        ref={inputRef}
        placeholder="Search for something in the documentation"
        style={{
          width: "90%",
          borderRadius: "2rem !important",
          borderTopRightRadius: "0px !important",
          borderBottomRightRadius: "0 !important",
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

const BtnRegenerateRes = ({
  originalQuery,
  setQueryData,
  setIsLoading,
}: {
  originalQuery: string;
  setQueryData: React.Dispatch<React.SetStateAction<string>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div
      style={{
        width: "100%",
        //border: "2px solid red",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Button
        onClick={() => {
          setQueryData("");
          setIsLoading(true);
          socket?.emit("askChatGPT", { query: originalQuery });
        }}
      >
        Regenerate response
      </Button>
    </div>
  );
};

const LoadingScreen = () => {
  return (
    <div
      className="loading-screen"
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        zIndex: 100,
        justifyContent: "center",
        alignItems: "center",
        //border: "2px solid red",
      }}
    >
      <Loader variant="dots" color="white" />
    </div>
  );
};
