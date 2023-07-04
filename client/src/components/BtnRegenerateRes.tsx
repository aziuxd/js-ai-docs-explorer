"use client";
import { Button } from "@mantine/core";

interface BtnRegenerateResProps {
  onBtnEvent: (variant: "submit" | "regenerate", idx: number) => any;
  id: number;
}

export const BtnRegenerateRes: React.FC<BtnRegenerateResProps> = ({
  onBtnEvent,
  id,
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
          onBtnEvent("regenerate", id);
        }}
      >
        Regenerate response
      </Button>
    </div>
  );
};
