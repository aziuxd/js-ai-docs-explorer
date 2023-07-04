"use client";
import "./styles.css";
import {
  Textarea,
  Button,
  Avatar,
  Loader,
  AppShell,
  Aside,
  Burger,
  Footer,
  Header,
  MediaQuery,
  Navbar,
  useMantineTheme,
  Text,
  Select,
  Slider,
  rem,
} from "@mantine/core";
import {
  IconSend,
  IconError404,
  IconExclamationCircle,
  IconClipboard,
  IconClipboardCheck,
} from "@tabler/icons-react";
import { useRef, useState, useEffect } from "react";
import Highlighter from "react-highlight-words";
import Linkify from "linkify-react";
import { useMediaQuery } from "@mantine/hooks";
import { io } from "socket.io-client";
import { useSettingsStore, useUiStore } from "../../lib/store";
import { useTheme } from "@emotion/react";

interface CustomError {
  message?: string;
}

type Models = "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-3.5";

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

/*export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [queryData, setQueryData] = useState<string>("");
  const inputRef = useRef(
    null
  ) as React.MutableRefObject<HTMLTextAreaElement | null>;
  const {
    isLoading,
    setNewData,
    setOriginalQuery,
    setAreDataCopied,
    setIsLoading,
  } = useUiStore();

  const onSubmit = async () => {
    setAreDataCopied(false);
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
          <PrettifiedData data={queryData} setQueryData={setQueryData} />
        ) : (
          ""
        )}
        <CustomInput
          inputRef={inputRef}
          searchQuery={searchQuery}
          onSubmit={onSubmit}
          setSearchQuery={setSearchQuery}
        />
      </div>
      <div></div>
    </main>
  );
}*/

export default function Home() {
  return <AppShellDemo />;
}

const BtnSubmit = ({
  onSubmit,
  searchQuery,
}: {
  onSubmit: () => any;
  searchQuery: string;
}) => {
  const match = useMediaQuery("(max-width: 400px)");
  const { newData } = useUiStore();
  return (
    <Button
      className="btn-submit"
      color="#71717a "
      style={{
        display: "flex",
        width: "10%",
        height: "100%",
        backgroundColor: "#868E96 !important",
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
          backgroundColor: `${!searchQuery && newData ? "#868E96" : "#228BE6"}`,
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
  setQueryData,
}: {
  data: string;
  setQueryData: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { newData, areDataCopied, setAreDataCopied } = useUiStore();
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
          maxHeight: "80%",
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
            <h2>{data.slice(0, data.indexOf(":"))}</h2>
            {!newData && data ? (
              areDataCopied ? (
                <IconClipboardCheck />
              ) : (
                <IconClipboard
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(data);
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
      {!newData && data && <BtnRegenerateRes setQueryData={setQueryData} />}
    </div>
  );
};

const CustomInput = ({
  inputRef,
  onSubmit,
  searchQuery,
  setSearchQuery,
}: {
  inputRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  onSubmit: () => any;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const match = useMediaQuery("(max-width: 768px)");
  return (
    <div
      style={{
        display: "flex",
        position: "fixed",
        bottom: "0",
        right: "0",
        width: match ? "100%" : "84.3%",
        //backgroundColor: "#71717a !important",
        backgroundColor: "#868E96",
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
        styles={{
          input: {
            borderTopRightRadius: "0px !important",
            borderBottomRightRadius: "0 !important",
          },
        }}
        form="searchQueryForm"
        className="search-query"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <BtnSubmit onSubmit={onSubmit} searchQuery={searchQuery} />
    </div>
  );
};

const BtnRegenerateRes = ({
  setQueryData,
}: {
  setQueryData: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { originalQuery, setIsLoading, setAreDataCopied } = useUiStore();
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
          setAreDataCopied(false);
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

const Sidebar = () => {
  const {
    model,
    temperature,
    index,
    changeModel,
    changeTemperature,
    changeIndex,
  } = useSettingsStore();
  const theme = useMantineTheme();

  return (
    <div
      className="sidebar"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "30px",
      }}
    >
      <Select
        label="Select the gpt model you do prefer"
        data={[
          { value: "gpt-3.5-turbo-16k", label: "gpt-3.5-turbo-16k" },
          { value: "gpt-3.5-turbo", label: "gpt-3.5-turbo" },
          { value: "gpt-3.5", label: "gpt-3.5" },
        ]}
        searchValue={model}
        defaultValue={model}
        onSearchChange={(e) => changeModel(e as Models)}
        styles={{
          input: {
            backgroundColor: "white",
            border: "white",
            borderTopRightRadius: "auto !important",
            borderBottomRightRadius: "auto !important",
            //outline: `${rem(2)} solid ${theme.colors.orange[5]}`,
          },
          label: {
            borderTopRightRadius: "auto !important",
            borderBottomRightRadius: "auto !important",
          },
        }}
        classNames={{
          input: "model-input",
        }}
      />
      <Slider
        marks={[
          { value: 0, label: "0%" },
          { value: 10, label: "10%" },
          { value: 50, label: "50%" },
          { value: 75, label: "75%" },
          { value: 100, label: "100%" },
        ]}
        defaultValue={temperature}
        onChange={(e) => changeTemperature(e)}
        styles={{
          markLabel: {
            color: "black",
          },
        }}
      />
      <Select
        label="Select your index"
        data={[{ value: "documentazione", label: "documentazione" }]}
        searchValue={index}
        defaultValue={index}
        onSearchChange={(e) => changeIndex(e)}
        styles={{
          input: {
            backgroundColor: "white",
            border: "white",
            borderTopRightRadius: "auto !important",
            borderBottomRightRadius: "auto !important",
            //outline: `${rem(2)} solid ${theme.colors.orange[5]}`,
          },
          label: {
            borderTopRightRadius: "auto !important",
            borderBottomRightRadius: "auto !important",
          },
        }}
        classNames={{
          input: "index-input",
        }}
      />
    </div>
  );
};

function AppShellDemo() {
  const [opened, setOpened] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [queryData, setQueryData] = useState<string>("");
  const inputRef = useRef(
    null
  ) as React.MutableRefObject<HTMLTextAreaElement | null>;
  const {
    isLoading,
    setNewData,
    setOriginalQuery,
    setAreDataCopied,
    setIsLoading,
  } = useUiStore();

  const onSubmit = async () => {
    setAreDataCopied(false);
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
    <AppShell
      styles={{
        main: {
          background: "#a1a1aa",
          overflowY: "auto",
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 200, lg: 300 }}
          style={{
            backgroundColor: "#868E96",
            border: "#868E96",
          }}
        >
          <Sidebar />
        </Navbar>
      }
      /*aside={
        <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
          <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
            <Text>Application sidebar</Text>
          </Aside>
        </MediaQuery>
      }
      footer={
        <Footer height={60} p="md">
          Application footer
        </Footer>
      }
    */
      header={
        <Header
          height={{ base: 50, md: 70 }}
          p="md"
          style={{
            backgroundColor: "#868E96",
            border: "#868E96",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={"white"}
                mr="xl"
              />
            </MediaQuery>

            <Text>Application header</Text>
          </div>
        </Header>
      }
    >
      <div
        className="container"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          maxHeight: "100%",
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
          <PrettifiedData data={queryData} setQueryData={setQueryData} />
        ) : (
          ""
        )}
        <CustomInput
          inputRef={inputRef}
          searchQuery={searchQuery}
          onSubmit={onSubmit}
          setSearchQuery={setSearchQuery}
        />
      </div>
    </AppShell>
  );
}
