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

interface CustomError {
  message?: string;
}

let socket: any;
export default function Page() {
  const [opened, setOpened] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [_, setQueryData] = useState<string>("");
  const [queryDataArr, updateQueryDataArr] = useImmer<any[]>([]);

  const inputRef = useRef(
    null
  ) as React.MutableRefObject<HTMLTextAreaElement | null>;
  const {
    isLoading,
    setNewData,
    setOriginalQuery,
    setAreDataCopied,
    setIsLoading,
    originalQuery,
    newData,
  } = useUiStore();
  const { model, temperature } = useSettingsStore();

  const onBtnEvent = async (
    variant: "submit" | "regenerate" = "submit",
    idx?: number
  ) => {
    setAreDataCopied(false);
    if (variant === "submit") setNewData(true);
    setQueryData("");
    if (variant === "regenerate" && typeof idx === "number" && idx >= 0)
      updateQueryDataArr((draft) => {
        draft[idx].content = "";
      });

    setIsLoading(true);
    if (variant === "submit") {
      setOriginalQuery(searchQuery);
    }
    try {
      if (
        variant === "submit"
          ? searchQuery.length < 3
          : queryDataArr[idx as number].originalQuery.length < 3
      ) {
        setIsLoading(false);
        throw new Error("Search query should be at lest 3 char long");
      }

      if (variant === "regenerate" && typeof idx === "number" && idx >= 0) {
        socket.emit("askChatGPT", {
          query: queryDataArr[idx].originalQuery,
          model,
          temperature,
          idx,
        });
      } else
        socket.emit("askChatGPT", {
          query: searchQuery,
          model,
          temperature,
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
      if (data.data === "DONE") {
        setNewData(false);
        updateQueryDataArr((draft) => {
          draft.push({});
        });
      }
      if (data.data && data.data !== "DONE") {
        setQueryData((prev) => {
          updateQueryDataArr((draft) => {
            const i = data.idx ? data.idx : draft.length - 1;
            if (!prev) {
              if (Object.is(draft[i], {})) {
                draft[i] = {
                  originalQuery: data.originalQuery,
                  content: data.data,
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
        /*setQueryData((prev) => {
          !prev
            ? setQueryDataArr([
                ...queryDataArr,
                {
                  content: data.data,
                  originalQuery,
                },
              ])
            : setQueryDataArr([
                ...queryDataArr,
                {
                  content: prev + data.data,
                  originalQuery,
                },
              ]);
          return prev + data.data;
        });*/
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
            backgroundColor: "#868E96",
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
          backgroundColor: "#a1a1aa",
          position: "relative",
        }}
      >
        {isLoading ? (
          <LoadingScreen />
        ) : queryDataArr.length !== 0 ? (
          queryDataArr.map((currData, idx) => {
            return Object.is(currData, {}) ? (
              ""
            ) : (
              <PrettifiedData
                data={currData}
                onBtnEvent={onBtnEvent}
                id={idx}
                key={idx}
              />
            );
          })
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
