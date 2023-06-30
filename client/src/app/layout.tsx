"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import { MantineProvider } from "@mantine/core";

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
        theme={{
          components: {
            InputWrapper: {
              styles: () => ({
                label: {
                  backgroundColor: "#71717a !important",
                },
              }),
            },
            Input: {
              styles: () => ({
                input: {
                  backgroundColor: "#71717a",
                  borderRadius: "none",
                  borderColor: "#71717a !important",
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
