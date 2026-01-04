import "./globals.css"; // Ensure this file exists and has Tailwind directives
import { SyncManager } from "@/components/SyncManager";

export const metadata = {
  title: "V-LINK 2.1 | Electoral Framework",
  description: "Secure Voter Mobility & Synchronization",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-blue-100">
        <SyncManager />
        {children}
      </body>
    </html>
  );
}
