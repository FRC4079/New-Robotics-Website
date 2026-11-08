import React from "react";

// Small inline SVG icon set (24x24, stroke based, inherits currentColor).
// Content stores icon *names* (e.g. "trophy"); legacy emoji values saved in an
// existing content file are mapped onto the same icons by resolveIconName().

const p = (d: string, key?: string | number): React.ReactElement => <path key={key ?? d} d={d} />;

const ICONS = {
    trophy: <>{p("M6 9H4.5a2.5 2.5 0 0 1 0-5H6")}{p("M18 9h1.5a2.5 2.5 0 0 0 0-5H18")}{p("M4 22h16")}{p("M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22")}{p("M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22")}{p("M18 2H6v7a6 6 0 0 0 12 0V2Z")}</>,
    users: <>{p("M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2")}<circle cx="9" cy="7" r="4" />{p("M22 21v-2a4 4 0 0 0-3-3.87")}{p("M16 3.13a4 4 0 0 1 0 7.75")}</>,
    bot: <><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" />{p("M12 7v4")}{p("M8 16h.01")}{p("M16 16h.01")}</>,
    award: <><circle cx="12" cy="8" r="6" />{p("M15.477 12.89 17 22l-5-3-5 3 1.523-9.11")}</>,
    target: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
    rocket: <>{p("M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z")}{p("m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z")}{p("M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0")}{p("M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5")}</>,
    zap: p("M13 2 3 14h9l-1 8 10-12h-9l1-8z"),
    graduation: <>{p("M22 10 12 5 2 10l10 5 10-5z")}{p("M6 12v5c3 3 9 3 12 0v-5")}{p("M22 10v6")}</>,
    handshake: <>{p("m11 17 2 2a1 1 0 1 0 3-3")}{p("m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4")}{p("m21 3 1 11h-2")}{p("M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3")}{p("M3 4h8")}</>,
    lightbulb: <>{p("M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5")}{p("M9 18h6")}{p("M10 22h4")}</>,
    wrench: p("M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"),
    code: <>{p("m16 18 6-6-6-6")}{p("m8 6-6 6 6 6")}</>,
    chart: <>{p("M3 3v18h18")}{p("M18 17V9")}{p("M13 17V5")}{p("M8 17v-3")}</>,
    palette: <>{p("M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z")}<circle cx="13.5" cy="6.5" r=".6" /><circle cx="17.5" cy="10.5" r=".6" /><circle cx="8.5" cy="7.5" r=".6" /><circle cx="6.5" cy="12.5" r=".6" /></>,
    pencil: <>{p("M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z")}{p("m15 5 4 4")}</>,
    file: <>{p("M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z")}{p("M14 2v4a2 2 0 0 0 2 2h4")}{p("M10 9H8")}{p("M16 13H8")}{p("M16 17H8")}</>,
    mail: <><rect x="2" y="4" width="20" height="16" rx="2" />{p("m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7")}</>,
    phone: p("M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"),
    pin: <>{p("M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z")}<circle cx="12" cy="10" r="3" /></>,
    message: p("M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"),
    settings: <>{p("M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z")}<circle cx="12" cy="12" r="3" /></>,
    clipboard: <><rect x="8" y="2" width="8" height="4" rx="1" />{p("M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2")}</>,
    refresh: <>{p("M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8")}{p("M21 3v5h-5")}{p("M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16")}{p("M8 16H3v5")}</>,
    trash: <>{p("M3 6h18")}{p("M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6")}{p("M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2")}{p("M10 11v6")}{p("M14 11v6")}</>,
    folder: p("M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"),
    check: p("M20 6 9 17l-5-5"),
    "check-circle": <><circle cx="12" cy="12" r="10" />{p("m9 12 2 2 4-4")}</>,
    "x-circle": <><circle cx="12" cy="12" r="10" />{p("m15 9-6 6")}{p("m9 9 6 6")}</>,
    x: <>{p("M18 6 6 18")}{p("m6 6 12 12")}</>,
    home: <>{p("m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z")}{p("M9 22V12h6v10")}</>,
    compass: <><circle cx="12" cy="12" r="10" />{p("m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z")}</>,
    info: <><circle cx="12" cy="12" r="10" />{p("M12 16v-4")}{p("M12 8h.01")}</>,
    logout: <>{p("M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4")}{p("m16 17 5-5-5-5")}{p("M21 12H9")}</>,
    plus: <>{p("M5 12h14")}{p("M12 5v14")}</>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" />{p("m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21")}</>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" />{p("M16 2v4")}{p("M8 2v4")}{p("M3 10h18")}</>,
    cpu: <><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />{p("M15 2v2")}{p("M15 20v2")}{p("M2 15h2")}{p("M2 9h2")}{p("M20 15h2")}{p("M20 9h2")}{p("M9 2v2")}{p("M9 20v2")}</>,
    megaphone: <>{p("m3 11 18-5v12L3 14v-3z")}{p("M11.6 16.8a3 3 0 1 1-5.8-1.6")}</>,
    dollar: <><circle cx="12" cy="12" r="10" />{p("M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8")}{p("M12 18V6")}</>,
    book: p("M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"),
    "arrow-right": <>{p("M5 12h14")}{p("m12 5 7 7-7 7")}</>,
    instagram: <><rect x="2" y="2" width="20" height="20" rx="5" />{p("M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z")}{p("M17.5 6.5h.01")}</>,
    youtube: <>{p("M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17")}{p("m10 15 5-3-5-3z")}</>,
    menu: <>{p("M4 12h16")}{p("M4 6h16")}{p("M4 18h16")}</>,
    upload: <>{p("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4")}{p("m17 8-5-5-5 5")}{p("M12 3v12")}</>,
    star: p("M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"),
    layers: <>{p("m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z")}{p("m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65")}{p("m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65")}</>,
} satisfies Record<string, React.ReactNode>;

export type IconName = keyof typeof ICONS;

// Emoji that older content files may still contain -> icon name.
const EMOJI_TO_ICON: Record<string, IconName> = {
    "🏆": "trophy", "👥": "users", "🤖": "bot", "🥇": "award", "🎯": "target",
    "🚀": "rocket", "⚡": "zap", "🎓": "graduation", "🤝": "handshake", "💡": "lightbulb",
    "🔧": "wrench", "💻": "code", "📊": "chart", "📈": "chart", "🎨": "palette",
    "📝": "file", "✏": "pencil", "✍": "pencil", "📧": "mail", "📞": "phone",
    "📍": "pin", "💬": "message", "⚙": "settings", "📋": "clipboard", "🔄": "refresh",
    "🗑": "trash", "📁": "folder", "✅": "check-circle", "❌": "x-circle", "🏠": "home",
    "🧭": "compass", "ℹ": "info", "🚪": "logout", "➕": "plus", "📸": "image",
    "📅": "calendar", "🔌": "cpu", "📢": "megaphone", "💰": "dollar", "📚": "book",
    "🌟": "star", "⭐": "star", "🏗": "layers",
};

export function resolveIconName(value: string | undefined | null): IconName | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (trimmed in ICONS) return trimmed as IconName;
    // Drop variation selectors / joiners before looking an emoji up.
    const bare = trimmed.replace(/[︎️‍]/g, "");
    return EMOJI_TO_ICON[bare] ?? null;
}

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

type IconProps = {
    name: string | undefined | null;
    size?: number | string;
    className?: string;
    title?: string;
};

export default function Icon({ name, size = 24, className, title }: IconProps): React.ReactElement | null {
    const resolved = resolveIconName(name);
    if (!resolved) return null;
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            role={title ? "img" : undefined}
            aria-hidden={title ? undefined : true}
            aria-label={title}
            focusable="false"
        >
            {title && <title>{title}</title>}
            {ICONS[resolved]}
        </svg>
    );
}
