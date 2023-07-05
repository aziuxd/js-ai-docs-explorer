"use client";
import { Loader } from "@mantine/core";

export const LoadingScreen = () => {
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
        backgroundColor: "white",
        //border: "2px solid red",
      }}
    >
      <Loader variant="dots" color="blue" />
    </div>
  );
};
