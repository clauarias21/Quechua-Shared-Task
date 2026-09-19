import type { Metadata } from "next";import "./globals.css";import {Header,Footer} from "@/components/site-shell";
export const metadata:Metadata={title:"Mayu — The Quechua Sky",description:"Explore Quechua sky names and Andean stories. An interactive guide with classroom resources and community contributions.",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body><a className="skip" href="#main">Skip to content</a><Header/>{children}<Footer/></body></html>}
