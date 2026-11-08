"use client";
import React from "react";
import Link from "next/link";
import styles from '@/app/_components/aboutbrief/aboutbrief.module.scss';
import {StaticImageData} from "next/image";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";
import Icon from "@/components/icons/Icon";
import { useContent } from "@/hooks/useContent";

type AboutBriefProps = {
    children?: React.ReactNode;
    img: StaticImageData;
    description: string;
}

export default function AboutBrief({ children, img, description }: AboutBriefProps): React.ReactElement {
    const { content } = useContent();
    const title: string = content?.homepage?.aboutBrief?.title || "About Us";

    return (
        <section className={styles.about}>
            <div className={styles.container}>
                <div className={styles.aboutContent}>
                    <EditableText
                        value={title}
                        path="homepage.aboutBrief.title"
                        as="h2"
                        className={styles.aboutTitle}
                    />
                    <EditableText
                        value={description}
                        path="homepage.aboutBrief.description"
                        as="p"
                        multiline={true}
                        className={styles.aboutText}
                    />
                    <Link href="/about" className={styles.aboutButton}>
                        Learn more <Icon name="arrow-right" size={18} />
                    </Link>
                </div>
                <div className={styles.aboutImage}>
                    <EditableImage
                        src={img.src}
                        alt="Oxford Academy Robotics team at a competition"
                        path="homepage.aboutBrief.image"
                        width={640}
                        height={420}
                    />
                </div>
            </div>
            { children }
        </section>
    )
};
