import { Montserrat, Titillium_Web } from "next/font/google";

// Titillium Web
const Titillium_Web_300 = Titillium_Web({
    weight: "300",
    style: 'normal',
    subsets: ['latin'],
});

const Titillium_Web_600 = Titillium_Web({
    weight: "600",
    style: 'normal',
    subsets: ['latin'],
});

const Titillium_Web_700 = Titillium_Web({
    weight: "700",
    style: 'normal',
    subsets: ['latin'],
});

const Titillium_Web_900 = Titillium_Web({
    weight: "900",
    style: 'normal',
    subsets: ['latin'],
});

// Montserrat
const Montserrat_300 = Montserrat({
    weight: "300",
    style: 'normal',
    subsets: ['latin'],
});

const Montserrat_500 = Montserrat({
    weight: "500",
    style: 'normal',
    subsets: ['latin'],
});

export const TW_300: string = Titillium_Web_300.className;
export const TW_600: string = Titillium_Web_600.className;
export const TW_700: string = Titillium_Web_700.className;
export const TW_900: string = Titillium_Web_900.className;
export const M_300: string = Montserrat_300.className;
export const M_500: string = Montserrat_500.className;
