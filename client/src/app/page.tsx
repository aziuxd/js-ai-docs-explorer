"use client";
import "./styles.css";
import { AppShell, Burger, Header, MediaQuery, Navbar } from "@mantine/core";
import { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useSettingsStore, useUiStore } from "../../lib/store";
import { CustomInput } from "@/components/CustomInput";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PrettifiedData } from "@/components/PrettifiedData";
import { Sidebar } from "@/components/Sidebar";
import { useImmer } from "use-immer";
import { BtnRegenerateRes } from "@/components/BtnRegenerateRes";

interface CustomError {
  message?: string;
}

let socket: any;
export default function Page() {
  const [opened, setOpened] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [queryData, setQueryData] = useState<string>("");
  const [queryDataArr, updateQueryDataArr] = useImmer<any[]>([]);

  const inputRef = useRef(
    null
  ) as React.MutableRefObject<HTMLTextAreaElement | null>;
  const {
    isLoading,
    setNewData,
    setOriginalQuery,
    setIsLoading,
    originalQuery,
    newData,
  } = useUiStore();
  const { model, temperature } = useSettingsStore();

  const onBtnEvent = async (variant: "submit" | "regenerate" = "submit") => {
    if (variant === "submit") setNewData(true);
    setQueryData("");
    if (variant === "regenerate")
      updateQueryDataArr((draft) => {
        const i = draft.length - 2 >= 0 ? draft.length - 2 : 0;
        draft[i].content = "";
      });

    setIsLoading(true);
    if (variant === "submit") {
      setOriginalQuery(searchQuery);
    }
    try {
      socket.emit("askChatGPT", {
        query: variant === "regenerate" ? originalQuery : searchQuery,
        model,
        temperature,
        variant,
      });

      if (variant === "submit") setSearchQuery("");
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
      if (data.data === "DONE" && data.variant !== "regenerate") {
        setNewData(false);
        updateQueryDataArr((draft) => {
          draft.push({});
        });
      }
      if (data.data && data.data !== "DONE") {
        if (data.variant === "regenerate") {
          setQueryData((prev) => {
            updateQueryDataArr((draft) => {});
            return prev + data.data;
          });
        } else
          setQueryData((prev) => {
            updateQueryDataArr((draft) => {
              const i = draft.length - 1 >= 0 ? draft.length - 1 : 0;
              if (!prev) {
                if (
                  (!draft[i]?.content && !draft[i]?.originalQuery) ||
                  Object.is({}, draft[i])
                ) {
                  draft[i] = {
                    originalQuery: data.originalQuery,
                    content: prev + data.data,
                  };
                } else
                  draft.push({
                    originalQuery: data.originalQuery,
                    content: data.data,
                  });
              } else {
                draft[i].content = prev + data.data;
              }
            });
            return prev + data.data;
          });

        setNewData(true);
      }
    });

    socket.on("err", (err: any) => {
      setIsLoading(false);
      updateQueryDataArr((draft) => {
        if (draft.length === 0) {
          draft.push({
            originalQuery,
            content:
              err.msg === "No data"
                ? "No matches found for your query"
                : err.msg,
          });
        } else {
          draft[draft.length - 1] = {
            originalQuery,
            content:
              err.msg === "No data"
                ? "No matches found for your query"
                : err.msg,
          };
        }

        draft.push({});
      });
      if (err.msg === "No data") {
        setQueryData("No matches found for your query");
      } else setQueryData(err.msg);
    });
  };

  return (
    <AppShell
      styles={{
        main: {
          background: "white",
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
            backgroundColor: "#228BE6",
            borderRight: "1px solid black",
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
            backgroundColor: "#228BE6",
            //border: "#868E96",
            borderBottom: "1px solid black",
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

            <h2
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              Silwa AI docs explorer
            </h2>
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
          maxHeight: "92%",
          overflowY: "auto",
          gap: "1rem",
          padding: "20px",
          paddingTop: "40px",
          //backgroundColor: "#9ca3af",
          backgroundColor: "white",
          position: "relative",
        }}
      >
        {isLoading ? (
          <LoadingScreen />
        ) : queryDataArr.length !== 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <ul
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {queryDataArr.map((currData, idx) => {
                return Object.is(currData, {}) ? (
                  ""
                ) : (
                  <PrettifiedData data={currData} key={idx} />
                );
              })}
            </ul>
            {!newData && queryData && (
              <BtnRegenerateRes onBtnEvent={onBtnEvent} />
            )}
          </div>
        ) : (
          ""
        )}
        <CustomInput
          inputRef={inputRef}
          searchQuery={searchQuery}
          onSubmit={onBtnEvent}
          setSearchQuery={setSearchQuery}
        />
      </div>
    </AppShell>
  );
}
