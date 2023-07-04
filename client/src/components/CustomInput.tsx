"use client";
import { Textarea } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { BtnSubmit } from "./BtnSubmit";

interface CustomInputProps {
  inputRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  onSubmit: () => any;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  inputRef,
  onSubmit,
  searchQuery,
  setSearchQuery,
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
