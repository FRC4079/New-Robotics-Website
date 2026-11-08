"use client";
import React from "react";
import Link from "next/link";
import styles from "./teamsOverview.module.scss";
import { useContent } from "@/hooks/useContent";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";
import Icon from "@/components/icons/Icon";

type Team = { id: string; logo: string; name: string; description: string; founded: string; link: string };

const DEFAULT_TEAMS: Team[] = [
  {
    id: "frc",
    logo: "/logos/FRCLogo.png",
    name: "FRC Team 4079",
    description: "Our flagship team competes in the FIRST Robotics Competition, building competition-ready robots for high-stakes district events.",
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

export default function TeamsOverview() {
  const { content } = useContent();
  const teams: Team[] = content?.teamsOverview || DEFAULT_TEAMS;

  return (
    <section className={styles.teamsOverviewSection}>
      <div className={styles.inner}>
        <EditableText
          className={styles.sectionTitle}
          value={content?.teamsOverviewTitle || "Meet Our Teams"}
          path="teamsOverviewTitle"
          as="h2"
        />
        <div className={styles.teamsGrid}>
          {teams.map((team: Team, index: number) => (
            <article className={styles.teamCard} key={team.id}>
              <div className={styles.logoTile}>
                <EditableImage
                  src={team.logo}
                  alt={`${team.name} logo`}
                  path={`teamsOverview.${index}.logo`}
                  width={120}
                  height={120}
                  objectFit="contain"
                />
              </div>
              <EditableText
                value={team.name}
                path={`teamsOverview.${index}.name`}
                as="h3"
              />
              <EditableText
                value={team.description}
                path={`teamsOverview.${index}.description`}
                as="p"
                multiline
              />
              <p className={styles.founded}>
                <Icon name="calendar" size={16} /> Founded{" "}
                <EditableText
                  value={String(team.founded).trim()}
                  path={`teamsOverview.${index}.founded`}
                  as="span"
                />
              </p>
              <Link href={team.link} className={styles.teamLink}>
                Learn more <Icon name="arrow-right" size={18} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
