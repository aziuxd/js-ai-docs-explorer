"use client";
import { useMantineTheme, Select, Slider } from "@mantine/core";
import { useSettingsStore } from "../../lib/store";

type Models = "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-3.5";

export const Sidebar = () => {
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
