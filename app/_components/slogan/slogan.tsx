"use client";
import React from "react";
import styles from "@/app/_components/slogan/slogan.module.scss";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";
import { useContent } from "@/hooks/useContent";

type SloganProps = {
    children?: React.ReactNode;
    goalsPath?: string;
}

type SloganItem = { id: string; text: string; image: string };

export default function Slogan({ children, goalsPath = "homepage.goals" }: SloganProps) {
    const { content } = useContent();

    const goals = content?.homepage?.goals;
    const displayTitle = goals?.title || "Our Goals";
    const displayDescription = goals?.description || "";
    const displaySlogans: SloganItem[] = goals?.slogans || [
        { id: "learn", text: "Learn", image: "/images/robotics/contact_bg.jpg" },
        { id: "compete", text: "Compete", image: "/images/comp/FRC_1.jpg" },
        { id: "thrive", text: "Thrive", image: "/images/comp/BB2024.jpg" }
    ];

    return (
        <section className={styles.slogan}>
            <div className={styles.containerHeader}>
                <EditableText
                    value={displayTitle}
                    path={`${goalsPath}.title`}
                    as="h2"
                    className={styles.headTitle}
                />
                <EditableText
                    value={displayDescription}
                    path={`${goalsPath}.description`}
                    as="p"
                    multiline
                    className={styles.headDescription}
                />
            </div>
            <div className={styles.container}>
                {displaySlogans.map((slogan: SloganItem, index: number) => (
                    <figure key={slogan.id} className={styles.sloganContent}>
                        <EditableImage
                            src={slogan.image}
                            alt=""
                            path={`${goalsPath}.slogans.${index}.image`}
                            className={styles.sloganImage}
                            width={400}
                            height={300}
                            objectFit="cover"
                        />
                        <figcaption>
                            <EditableText
                                value={slogan.text}
                                path={`${goalsPath}.slogans.${index}.text`}
                                as="h3"
                                className={styles.sloganTitle}
                            />
                        </figcaption>
                    </figure>
                ))}
            </div>
            { children }
        </section>
    )
}
