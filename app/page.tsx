import React from "react";
import { Metadata } from "next";
import Navbar from "@/app/_components/navbar/navbar";
import styles from "@/app/home.module.scss";
import Footer from "@/app/_components/footer/footer";
import Title from "@/app/_components/title/title";
import AboutBrief from "@/app/_components/aboutbrief/aboutbrief";
import Slogan from "@/app/_components/slogan/slogan";
import Stats from "@/app/_components/stats/stats";
import TeamsOverview from "@/app/_components/teamsOverview/teamsOverview";
import { getServerContent } from "@/utils/contentStore";

export async function generateMetadata(): Promise<Metadata> {
    const content = await getServerContent();
    return {
        title: `Home - ${content?.site?.title || 'OA Robotics'}`,
        description: content?.site?.description || 'Oxford Academy Robotics - Excellence in FRC, FTC, and VEX robotics competitions. Join our award-winning STEM education programs.',
        keywords: content?.site?.keywords || 'Oxford Academy Robotics, FRC Team 4079, FTC Teams, VEX Teams, STEM Education, Robotics Competition'
    };
}

// Images
import frontBannerImg from "@/public/images/FrontPageBanner.png";
import collage2Img from "@/public/images/comp/BB2024_2.jpg";
import designImg from "@/public/handmade/FrontPageDesign.webp";

export default async function Home(): Promise<React.ReactElement> {
    const content = await getServerContent();
    
    return (
        <div className={`${styles.homepage}`}>
            <Navbar isFixed={true}/>
            <Title
                title={content?.homepage?.hero?.title || "OXFORD ACADEMY ROBOTICS"}
                description={content?.homepage?.hero?.subtitle || "Learn. Compete. Thrive."}
                img1={frontBannerImg}
                img2={designImg}
            />
            <AboutBrief
                img={collage2Img}
                description={content?.homepage?.aboutBrief?.description || "Oxford Academy Robotics is a student-run organization that competes in the FIRST Robotics Competition (FRC), FIRST Tech Challenge (FTC), and VEX Robotics Competition. Our mission is to inspire students to pursue careers in STEM fields by providing them with the opportunity to learn, compete, and thrive in a supportive environment."}
            />
            <Stats />
            {/* <NewsSection 
                title="Latest News"
                maxArticles={3}
                showAll={false}
            /> */}
            <Slogan />

            <TeamsOverview />

            {/* <Achievements 
                title="Recent Achievements"
            /> */}
            <Footer/>
        </div>
    )
}