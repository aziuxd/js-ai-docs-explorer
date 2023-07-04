"use client";
import "./styles.css";
import {
  AppShell,
  Burger,
  Header,
  MediaQuery,
  Navbar,
  Text,
} from "@mantine/core";
import { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useSettingsStore, useUiStore } from "../../lib/store";
import { CustomInput } from "@/components/CustomInput";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PrettifiedData } from "@/components/PrettifiedData";
import { Sidebar } from "@/components/Sidebar";

interface CustomError {
  message?: string;
}

let socket: any;
export default function Page() {
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
  const { model, temperature } = useSettingsStore();

  const onBtnEvent = async (variant: "submit" | "regenerate" = "submit") => {
    setAreDataCopied(false);
    if (variant === "submit") setNewData(true);
    setQueryData("");
    setIsLoading(true);
    if (variant === "submit") setOriginalQuery(searchQuery);
    try {
      if (searchQuery.length < 3) {
        setIsLoading(false);
        throw new Error("Search query should be at lest 3 char long");
      }
      socket.emit("askChatGPT", { query: searchQuery, model, temperature });
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
            borderRight: "2px solid black",
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
            borderBottom: "2px solid black",
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
          <PrettifiedData data={queryData} onBtnEvent={onBtnEvent} />
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
