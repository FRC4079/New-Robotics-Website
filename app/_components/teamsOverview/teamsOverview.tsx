"use client";
import React from "react";
import styles from "./teamsOverview.module.scss";
import { useContent } from "@/hooks/useContent";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";

export default function TeamsOverview() {
  const { content } = useContent();
  
  // Use CMS data or fallback to defaults
  const teams = content?.teamsOverview || [
    {
      id: "frc",
      logo: "/logos/FRCLogo.png",
      name: "FRC Team 4079",
      description: "Our flagship team competes in the FIRST Robotics Competition, innovating and building competition-ready robots for high-stakes regional competitions.",
      founded: "2012",
      link: '/frc'
    },
    {
      id: "ftc",
      logo: "/logos/FTCLogo.png",
      name: "FTC Teams 19812 & 23796",
      description: "Our FTC teams design, build, and program robots to compete in alliance-based challenges, focusing on innovation and teamwork.",
      founded: "2021",
      link: '/ftc'
    },
    {
      id: "vex",
      logo: "/logos/VEXLogo.png",
      name: "VEX Robotics",
      description: "Our VEX teams compete in game-based engineering challenges, where our program began and continues to grow new talent.",
      founded: "2009",
      link: '/vex'
    },
  ];

  return (
    <section className={styles.teamsOverviewSection}>
      <EditableText 
        className={styles.sectionTitle}
        value="Meet Our Teams"
        path="teamsOverview.sectionTitle"
        as="h2"
      />
      <div className={styles.teamsGrid}>
        {teams.map((team: { id: string; logo: string; name: string; description: string; founded: string; link: string }, index: number) => (
          <div className={styles.teamCard} key={team.id}>
            <EditableImage
              src={team.logo}
              alt={team.name + " Logo"}
              path={`teamsOverview.${index}.logo`}
              width={150}
              height={150}
              objectFit="contain"
            />
            <EditableText 
              value={team.name}
              path={`teamsOverview.${index}.name`}
              as="h3"
            />
            <EditableText 
              value={team.description}
              path={`teamsOverview.${index}.description`}
              as="p"
            />
            <div className={styles.founded}>
              Founded: <EditableText 
                value={team.founded}
                path={`teamsOverview.${index}.founded`}
                as="span"
              />
            </div>
            <a href={team.link} className={styles.teamLink}>
              <EditableText 
                value="Learn More"
                path={`teamsOverview.${index}.linkText`}
                as="span"
              />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
