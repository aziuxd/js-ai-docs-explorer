"use client";
import { Inter } from "next/font/google";
import { MantineProvider } from "@mantine/core";

const inter = Inter({ subsets: ["latin"] });

export const Mantine = ({ children }: { children: React.ReactNode }) => {
  return (
    <MantineProvider
      withNormalizeCSS
      withGlobalStyles
      theme={{
        components: {
          InputWrapper: {
            styles: () => ({
              label: {
                backgroundColor: "#228BE6 !important",
                borderTopRightRadius: "0px !important",
                borderBottomRightRadius: "0 !important",
              },
            }),
          },
          Input: {
            styles: () => ({
              input: {
                backgroundColor: "#868E96",
                borderColor: "#868E96 !important",
              },
            }),
          },
        },
      }}
    >
      <body className={inter.className}>{children}</body>
    </MantineProvider>
  );
};
