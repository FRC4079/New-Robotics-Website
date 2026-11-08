"use client";
import React from "react";
import styles from "@/app/_components/navbar/navbar.module.scss";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useContent } from "@/hooks/useContent";
import { useAuth } from "@/hooks/useAuth";
import { useEditMode } from "@/contexts/EditModeContext";
import Icon from "@/components/icons/Icon";

type NavbarProps = {
    children?: React.ReactNode;
    isFixed?: boolean;
}

type DynamicLink = {
    name: string;
    href: string;
}

const DEFAULT_LINKS: DynamicLink[] = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Sponsors", href: "/sponsors" },
    { name: "FRC", href: "/frc" },
    { name: "FTC", href: "/ftc" },
    { name: "VEX", href: "/vex" },
    { name: "Contact", href: "/contact" },
];

export default function Navbar({ children, isFixed = true }: NavbarProps): React.ReactElement {
    const { content } = useContent();
    const { isAuthenticated, logout } = useAuth();
    const { isEditMode, enableEditMode } = useEditMode();
    const pathname = usePathname();

    // The menu is "open for" a specific page, so navigating closes it without an effect.
    const [openPath, setOpenPath] = React.useState<string | null>(null);
    const menuOpen: boolean = openPath === pathname;
    const toggleMenu = (): void => setOpenPath(menuOpen ? null : pathname);

    React.useEffect((): (() => void) | void => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent): void => {
            if (e.key === "Escape") setOpenPath(null);
        };
        document.addEventListener("keydown", onKey);
        return (): void => document.removeEventListener("keydown", onKey);
    }, [menuOpen]);

    const branding = content?.site || {
        logo: "/logos/OARoboticsLogo_24-25.webp",
        logoAlt: "OA Robotics Logo",
        organizationName: "OA Robotics"
    };

    const links: DynamicLink[] = content?.navigation?.items
        ?.filter(item => item.visible)
        .sort((a, b) => a.order - b.order) || DEFAULT_LINKS;

    const isCurrent = (href: string): boolean =>
        href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

    return (
        <header className={`${styles.navbar} ${isFixed ? styles.fixed : ""}`}>
            <div className={styles.container}>
                <Link href="/" className={styles.brand}>
                    <Image src={branding.logo} alt={branding.logoAlt} width={40} height={40} priority />
                    <span>{branding.organizationName}</span>
                </Link>
                {children}

                <button
                    type="button"
                    className={styles.menuButton}
                    aria-expanded={menuOpen}
                    aria-controls="site-menu"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    onClick={toggleMenu}
                >
                    <Icon name={menuOpen ? "x" : "menu"} size={24} />
                </button>

                <nav
                    id="site-menu"
                    aria-label="Main"
                    className={`${styles.menu} ${menuOpen ? styles.menuOpen : ""}`}
                >
                    <ul className={styles.links}>
                        {links.map((link: DynamicLink) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={styles.link}
                                    aria-current={isCurrent(link.href) ? "page" : undefined}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {isAuthenticated && (
                        <div className={styles.adminActions}>
                            {!isEditMode && (
                                <button type="button" className={styles.editModeButton} onClick={enableEditMode}>
                                    <Icon name="pencil" size={16} /> Edit mode
                                </button>
                            )}
                            <button type="button" className={styles.logoutButton} onClick={logout}>
                                <Icon name="logout" size={16} /> Log out
                            </button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}
