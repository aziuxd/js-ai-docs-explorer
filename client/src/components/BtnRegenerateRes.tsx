"use client";
import { Button } from "@mantine/core";

interface BtnRegenerateResProps {
  onBtnEvent: (variant: "submit" | "regenerate") => any;
}

export const BtnRegenerateRes: React.FC<BtnRegenerateResProps> = ({
  onBtnEvent,
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
          onBtnEvent("regenerate");
        }}
      >
        Regenerate response
      </Button>
    </div>
  );
};
