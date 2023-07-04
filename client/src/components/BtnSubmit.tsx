"use client";
import { Button } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconSend } from "@tabler/icons-react";
import { useUiStore } from "../../lib/store";

interface BtnSubmitProps {
  onSubmit: () => any;
  searchQuery: string;
}

export const BtnSubmit: React.FC<BtnSubmitProps> = ({
  onSubmit,
  searchQuery,
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
        backgroundColor: "#4dabf7 !important",
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
      disabled={searchQuery === "" && newData}
    >
      <IconSend
        onClick={() => onSubmit()}
        className="send-icon"
        size={25}
        style={{
          //border: "2px solid yellow",
          cursor: "pointer",
          backgroundColor: `${!searchQuery && newData ? "#4dabf7" : "#228BE6"}`,
          opacity: "1",
          padding: "0",
          borderRadius: "2px",
          //border: "2px solid yellow",
        }}
      />
    </Button>
  );
};
