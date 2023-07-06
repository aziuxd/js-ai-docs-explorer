import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider, SignedIn, SignedOut, SignUp } from "@clerk/nextjs";
import { Mantine } from "@/components/Mantine";

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
    <ClerkProvider>
      <html lang="en">
        <SignedIn>
          <Mantine>{children}</Mantine>
        </SignedIn>
        <SignedOut>
          <SignUp />
        </SignedOut>
      </html>
    </ClerkProvider>
  );
}
