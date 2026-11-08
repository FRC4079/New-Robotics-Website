import localFont from "next/font/local";

// Site-wide fonts, bundled with the site (SIL Open Font License) so they load
// without any request to a third party. The variables are applied on <html>
// in the root layout and consumed through --font-display / --font-body in
// app/globals.scss.
const display = localFont({
    src: [
        { path: "../app/fonts/titillium-web-latin-400-normal.woff2", weight: "400", style: "normal" },
        { path: "../app/fonts/titillium-web-latin-600-normal.woff2", weight: "600", style: "normal" },
        { path: "../app/fonts/titillium-web-latin-700-normal.woff2", weight: "700", style: "normal" },
        { path: "../app/fonts/titillium-web-latin-900-normal.woff2", weight: "900", style: "normal" },
    ],
    variable: "--font-titillium",
    display: "swap",
});

const body = localFont({
    src: "../app/fonts/inter-latin-wght-normal.woff2",
    weight: "100 900",
    style: "normal",
    variable: "--font-inter",
    display: "swap",
});

export const fontVariables: string = `${display.variable} ${body.variable}`;
