import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Class Scheduler",
  description: "Browse courses, build a conflict-free schedule.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fraunces.variable} ${inter.variable} font-sans antialiased`}>
        {/* Pre-hydration script prevents theme flash on initial load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('scheduler-theme') || 'system';
                  const mode = stored === 'light' || stored === 'dark' ? stored : 'system';
                  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const effective = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
                  document.documentElement.className = effective === 'dark' ? 'theme-dark' : 'theme-light';
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}