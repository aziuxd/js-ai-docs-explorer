"use client";
import { Button } from "@mantine/core";
import { useEffect, forwardRef, useRef } from "react";

export const BtnRegenerateRes = forwardRef(function BtnRegenerateRes(
  {
    onBtnEvent,
    onComponentDidMount,
  }: {
    onBtnEvent: (variant: "submit" | "regenerate") => any;
    onComponentDidMount: () => void;
  },
  ref: React.ForwardedRef<HTMLDivElement | null>
) {
  const onMountRef = useRef(onComponentDidMount);

  useEffect(() => {
    onMountRef.current();
  }, []);
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
          onBtnEvent("regenerate");
        }}
      >
        Regenerate response
      </Button>
    </div>
  );
});
