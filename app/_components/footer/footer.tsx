"use client";
import React from "react";
import styles from "@/app/_components/footer/footer.module.scss";
import {TW_600} from "@/utils/globalFonts";
import { useContent } from "@/hooks/useContent";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";

type FooterProps = {
    children?: React.ReactNode;
}

export default function Footer({children}: FooterProps) {
    const { content } = useContent();
    
    // Fallback to defaults if CMS content not available
    const footerData = content?.footer || {
        branding: {
            logo: "/logos/OARoboticsLogo_24-25.webp",
            logoAlt: "OA Robotics Logo",
            organizationName: "OA Robotics",
            teamName: "Quantum Leap",
            schoolName: "Oxford Academy"
        },
        contact: {
            address: "5172 Orange Avenue",
            addressLine2: "Cypress, CA 90630"
        },
        quickLinks: [],
        social: [],
        legal: {
            copyright: "© 2025 OA Robotics. All rights reserved."
        }
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerTop}>
                    <div className={styles.footerDetails}>
                        <div className={`${styles.orgDetails} ${TW_600}`}>
                            <h2>
                                <EditableImage
                                    src={footerData.branding.logo}
                                    alt={footerData.branding.logoAlt}
                                    path="footer.branding.logo"
                                    width={50}
                                    height={50}
                                    objectFit="contain"
                                />
                                <EditableText
                                    value={footerData.branding.organizationName}
                                    path="footer.branding.organizationName"
                                    as="span"
                                />
                            </h2>
                            <EditableText
                                value={footerData.branding.teamName}
                                path="footer.branding.teamName"
                                as="p"
                            />
                            <EditableText
                                value={footerData.branding.schoolName}
                                path="footer.branding.schoolName"
                                as="p"
                            />
                            <EditableText
                                value={footerData.contact.address}
                                path="footer.contact.address"
                                as="p"
                            />
                            {footerData.contact.addressLine2 && (
                                <EditableText
                                    value={footerData.contact.addressLine2}
                                    path="footer.contact.addressLine2"
                                    as="p"
                                />
                            )}
                        </div>

                        <div className={styles.footerSocials}>
                        </div>
                    </div>

                    <div className={`${styles.footerLinks} ${TW_600}`}>
                        <EditableText
                            value="Quick Links"
                            path="footer.quickLinks.title"
                            as="h1"
                        />
                        {footerData.quickLinks.map((link: { href: string; name: string }, index: number) => (
                            <a key={index} href={link.href}>
                                <EditableText
                                    value={link.name}
                                    path={`footer.quickLinks.${index}.name`}
                                    as="span"
                                />
                            </a>
                        ))}
                    </div>

                    <div className={`${styles.footerLinks} ${TW_600}`}>
                        <EditableText
                            value="Our Socials"
                            path="footer.social.title"
                            as="h1"
                        />
                        {footerData.social.map((social: { url: string; platform: string }, index: number) => (
                            <a key={index} href={social.url} target="_blank" rel="noopener noreferrer">
                                <EditableText
                                    value={social.platform}
                                    path={`footer.social.${index}.platform`}
                                    as="span"
                                />
                            </a>
                        ))}
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <div className={`${styles.footerBottomLinks} ${TW_600}`}>
                        <EditableText
                            value={footerData.legal.copyright}
                            path="footer.legal.copyright"
                            as="p"
                        />
                        {footerData.legal.websiteDeveloper && (
                            <EditableText
                                value={footerData.legal.websiteDeveloper}
                                path="footer.legal.websiteDeveloper"
                                as="p"
                            />
                        )}
                        {footerData.legal.betaNotice && (
                            <EditableText
                                value={footerData.legal.betaNotice}
                                path="footer.legal.betaNotice"
                                as="p"
                            />
                        )}
                    </div>
                </div>
            </div>

            {children}
        </footer>
    );
}