"use client";
import React from "react";
import styles from "@/app/_components/slogan/slogan.module.scss";
import {TW_300, TW_600, TW_900} from "@/utils/globalFonts";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";
import { useContent } from "@/hooks/useContent";

type SloganProps = {
    children?: React.ReactNode;
    goalsPath?: string;
}

export default function Slogan({ children, goalsPath = "homepage.goals" }: SloganProps) {
    const { content } = useContent();
    
    const goals = content?.homepage?.goals;
    const displayTitle = goals?.title || "Our Goals";
    const displayDescription = goals?.description || "We are Oxford Academy Robotics...";
    const displaySlogans = goals?.slogans || [
        { id: "learn", text: "Learn", image: "/images/robotics/contact_bg.jpg" },
        { id: "compete", text: "Compete", image: "/images/comp/FRC_1.jpg" },
        { id: "thrive", text: "Thrive", image: "/images/comp/BB2024.jpg" }
    ];

    return (
        <section className={`${styles.slogan} ${TW_300}`}>
            <div className={styles.containerHeader}>
                <EditableText 
                    value={displayTitle}
                    path={`${goalsPath}.title`}
                    as="h1"
                    className={`${styles.headTitle} ${TW_600}`}
                />
                <EditableText 
                    value={displayDescription}
                    path={`${goalsPath}.description`}
                    as="h2"
                    className={`${styles.headDescription} ${TW_300}`}
                />
            </div>
            <div className={styles.container}>
                {displaySlogans.map((slogan: { id: string; text: string; image: string }, index: number) => (
                    <div key={slogan.id} className={styles.sloganContent}>
                        <EditableImage
                            src={slogan.image}
                            alt="Oxford Academy Robotics"
                            path={`${goalsPath}.slogans.${index}.image`}
                            className={styles.sloganImage}
                            width={400}
                            height={300}
                            objectFit="cover"
                        />
                        <EditableText
                            value={slogan.text}
                            path={`${goalsPath}.slogans.${index}.text`}
                            as="h1"
                            className={`${styles.sloganTitle} ${TW_900}`}
                        />
                    </div>
                ))}
            </div>
            { children }
        </section>
    )
}