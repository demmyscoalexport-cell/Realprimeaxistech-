import { type ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { CommandPalette } from "./command-palette";
import { LiveTicker } from "./live-ticker";
import { KeyboardOverlay } from "./keyboard-overlay";
import { GlobalShortcuts } from "./global-shortcuts";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <LiveTicker />
      <Header
        onOpenSearch={() =>
          window.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: "k",
              ctrlKey: true,
              bubbles: true,
            }),
          )
        }
      />
      <main className="flex-1">{children}</main>
      <Footer />
      <CommandPalette />
      <KeyboardOverlay />
      <GlobalShortcuts />
    </div>
  );
}
