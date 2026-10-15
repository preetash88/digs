import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Motion } from "@/components/Motion";

export const metadata: Metadata = {
    title: "Digs – share houses, rooms and stays in Australia and New Zealand",
    description: "Find a room, a flatmate, a whole share house or a short stay across Australia and New Zealand. Free to list.",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: "#0d1a15",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en-AU" suppressHydrationWarning>
        <head>
            <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Figtree:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />
        </head>
        <body>
        <div className="switch-bar" aria-hidden="true" />
        {children}
        <Motion />
        </body>
        </html>
    );
}