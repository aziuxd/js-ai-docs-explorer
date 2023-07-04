"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import { MantineProvider, rem } from "@mantine/core";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI docs explorer",
  description: "An AI powered docs explorer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <MantineProvider
        withNormalizeCSS
        withGlobalStyles
        theme={{
          /*focusRingStyles: {
            // reset styles are applied to <button /> and <a /> elements
            // in &:focus:not(:focus-visible) selector to mimic
            // default browser behavior for native <button /> and <a /> elements
            resetStyles: () => ({ outline: "none" }),

            // styles applied to all elements except inputs based on Input component
            // styled are added with &:focus selector
            styles: (theme) => ({
              outline: `${rem(2)} solid ${theme.colors.orange[5]}`,
            }),

            // focus styles applied to components that are based on Input
            // styled are added with &:focus selector
            inputStyles: (theme) => ({
              outline: `${rem(2)} solid ${theme.colors.orange[5]}`,
            }),
          },*/
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
    </html>
  );
}
