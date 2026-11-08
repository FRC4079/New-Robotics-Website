import React from "react";
import styles from "./teamPageLayout.module.scss";
import Navbar from "@/app/_components/navbar/navbar";
import Footer from "@/app/_components/footer/footer";
import Title from "@/app/_components/title/title";
import { StaticImageData } from "next/image";

interface TeamPageLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  bannerImage: StaticImageData;
  /** Content path of the hero text and banner, for example "teams.frc.hero". */
  heroPath?: string;
}

export default function TeamPageLayout({ 
  children, 
  title, 
  description, 
  bannerImage,
  heroPath
}: TeamPageLayoutProps): React.ReactElement {
  return (
    <div className={styles.teamPage}>
      <Navbar />
      <Title
        title={title}
        description={description}
        img1={bannerImage}
        heroPath={heroPath}
      />
      <div className={styles.content}>
        {children}
      </div>
      <Footer />
    </div>
  );
}
