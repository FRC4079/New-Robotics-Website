"use client";
import React from "react";
import styles from "@/app/news/news.module.scss";
import Navbar from "@/app/_components/navbar/navbar";
import Footer from "@/app/_components/footer/footer";
import Title from "@/app/_components/title/title";
import NewsSection from "@/app/_components/newsSection/newsSection";
import CustomSections from "@/components/sections/CustomSections";
import { useContent } from "@/hooks/useContent";

export default function News(): React.ReactElement {
    const { content } = useContent();

    const newsData = content?.news || {
        hero: {
            title: "Latest News & Updates",
            subtitle: "Stay informed with our team's achievements",
            description: "Stay up to date with our team's achievements and activities",
            backgroundImage: "/images/FrontPageBanner.png"
        },
        articles: []
    };

    return (
        <div className={styles.newsPage}>
            <Navbar />
            <Title 
                title={newsData.hero.title}
                description={newsData.hero.subtitle ?? newsData.hero.description}
                heroPath="news.hero"
            />
            <CustomSections pageKey="news" placement="after-hero" showAddButton={false} />
            <NewsSection 
                articles={newsData.articles}
                showAll={true}
                title="All News Articles"
            />
            <CustomSections pageKey="news" placement="before-footer" />
            <Footer />
        </div>
    );
}
