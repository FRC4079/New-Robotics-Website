"use client";
import React from "react";
import styles from "@/app/about/about.module.scss";
import Navbar from "@/app/_components/navbar/navbar";
import Footer from "@/app/_components/footer/footer";
import { useContent } from "@/hooks/useContent";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";

export default function About() {
    const { content } = useContent();
    
    const aboutData = content?.about || {
        hero: {
            title: "Oxford Academy Robotics",
            subtitle: "Inspiring the Next Generation of Innovators",
            description: "Since 2009, we've been empowering students through competitive robotics, building not just robots, but future engineers, innovators, and leaders who will shape tomorrow's world.",
            stats: [
                { number: "15+", label: "Years Strong" },
                { number: "500+", label: "Students Impacted" },
                { number: "3", label: "Competition Leagues" }
            ]
        },
        mission: {
            sectionTitle: "Our Mission & Vision",
            cards: [
                {
                    icon: "🎯",
                    title: "Mission",
                    description: "To inspire and prepare students for careers in STEM through competitive robotics, fostering innovation, teamwork, and technical excellence."
                },
                {
                    icon: "🚀",
                    title: "Vision",
                    description: "To be a leading robotics program that empowers students to become the next generation of engineers and innovators who will shape the future."
                },
                {
                    icon: "⚡",
                    title: "Values",
                    description: "Excellence, Innovation, Collaboration, Integrity, and Continuous Learning drive everything we do as we build both robots and character."
                }
            ]
        },
        programs: {
            sectionTitle: "Our Programs",
            programList: [
                {
                    logo: "/logos/FRCLogo.png",
                    title: "FIRST Robotics Competition",
                    description: "Our flagship program where students design, build, and compete with 120-pound robots.",
                    features: ["Team 4079", "120lb Robots", "6-Week Build Season"]
                },
                {
                    logo: "/logos/FTCLogo.png",
                    title: "FIRST Tech Challenge",
                    description: "Students design, build, and program robots to compete in an alliance format against other teams.",
                    features: ["Multiple Teams", "Android Programming", "Strategic Alliances"]
                },
                {
                    logo: "/logos/VEXLogo.png",
                    title: "VEX Robotics Competition",
                    description: "Where our journey began! Students work in teams to design and build a robot.",
                    features: ["Our Origins", "Metal Construction", "Programming Skills"]
                }
            ]
        },
        impact: {
            sectionTitle: "Our Impact",
            cards: [
                {
                    icon: "🎓",
                    title: "Student Success",
                    description: "100% of our alumni go on to pursue higher education, with 85% entering STEM fields."
                },
                {
                    icon: "🏆",
                    title: "Competition Excellence",
                    description: "Over 50 awards earned across all competition levels and multiple championship appearances."
                },
                {
                    icon: "🤝",
                    title: "Community Outreach",
                    description: "Mentoring younger teams and promoting STEM education throughout our local community."
                },
                {
                    icon: "💡",
                    title: "Innovation Hub",
                    description: "Students develop real-world engineering skills and innovative solutions to complex challenges."
                }
            ]
        },
        join: {
            title: "Ready to Join the Future?",
            description: "Whether you're interested in mechanical engineering, programming, business, or design, there's a place for you on our team.",
            primaryButton: "Get Involved",
            secondaryButton: "Support Us"
        }
    };

    // Ensure nested properties exist with fallbacks
    const heroStats = aboutData.hero?.stats || [];
    const missionCards = aboutData.mission?.cards || [];
    const programList = aboutData.programs?.programList || [];
    const impactCards = aboutData.impact?.cards || [];
    
    const missionSectionTitle = aboutData.mission?.sectionTitle || "Our Mission & Vision";
    const programsSectionTitle = aboutData.programs?.sectionTitle || "Our Programs";
    const impactSectionTitle = aboutData.impact?.sectionTitle || "Our Impact";
    const joinTitle = aboutData.join?.title || "Join Our Team";
    const joinDescription = aboutData.join?.description || "Ready to be part of something extraordinary?";
    const joinPrimaryButton = aboutData.join?.primaryButton || "Get Started";
    const joinSecondaryButton = aboutData.join?.secondaryButton || "Learn More";
    
    return (
        <div className={styles.about}>
            <Navbar isFixed={true}/>
            
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.container}>
                    <div className={styles.heroContent}>
                        <EditableText
                            value={aboutData.hero?.title || "Oxford Academy Robotics"}
                            path="about.hero.title"
                            as="h1"
                        />
                        <EditableText
                            value={aboutData.hero?.subtitle || "Inspiring the Next Generation"}
                            path="about.hero.subtitle"
                            as="div"
                            className={styles.heroSubtitle}
                        />
                        <EditableText
                            value={aboutData.hero?.description || "Building the future through innovation"}
                            path="about.hero.description"
                            as="div"
                            className={styles.heroDescription}
                            multiline
                        />
                        <div className={styles.heroStats}>
                            {heroStats.map((stat: { number: string; label: string }, index: number) => (
                                <div key={index} className={styles.stat}>
                                    <EditableText
                                        value={stat.number}
                                        path={`about.hero.stats.${index}.number`}
                                        as="span"
                                        className={styles.statNumber}
                                    />
                                    <EditableText
                                        value={stat.label}
                                        path={`about.hero.stats.${index}.label`}
                                        as="span"
                                        className={styles.statLabel}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className={styles.missionSection}>
                <div className={styles.container}>
                    <EditableText
                        value={missionSectionTitle}
                        path="about.mission.sectionTitle"
                        as="h2"
                    />
                    <div className={styles.missionGrid}>
                        {missionCards.map((card: { icon: string; title: string; description: string }, index: number) => (
                            <div key={index} className={styles.missionCard}>
                                <div className={styles.cardIcon}>
                                    <EditableText
                                        value={card.icon}
                                        path={`about.mission.cards.${index}.icon`}
                                        as="span"
                                    />
                                </div>
                                <EditableText
                                    value={card.title}
                                    path={`about.mission.cards.${index}.title`}
                                    as="h3"
                                />
                                <EditableText
                                    value={card.description}
                                    path={`about.mission.cards.${index}.description`}
                                    as="div"
                                    multiline
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Programs Section */}
            <section className={styles.programsSection}>
                <div className={styles.container}>
                    <EditableText
                        value={programsSectionTitle}
                        path="about.programs.sectionTitle"
                        as="h2"
                    />
                    <div className={styles.programsGrid}>
                        {programList.map((program: { logo: string; title: string; description: string; features: string[] }, index: number) => (
                            <div key={index} className={styles.programCard}>
                                <div className={styles.programHeader}>
                                    <EditableImage
                                        src={program.logo}
                                        alt={`${program.title} Logo`}
                                        path={`about.programs.programList.${index}.logo`}
                                        className={styles.programLogo}
                                        width={80}
                                        height={80}
                                        objectFit="contain"
                                    />
                                    <EditableText
                                        value={program.title}
                                        path={`about.programs.programList.${index}.title`}
                                        as="h3"
                                    />
                                </div>
                                <EditableText
                                    value={program.description}
                                    path={`about.programs.programList.${index}.description`}
                                    as="div"
                                    multiline
                                />
                                <div className={styles.programFeatures}>
                                    {program.features.map((feature: string, fIndex: number) => (
                                        <span key={fIndex}>
                                            <EditableText
                                                value={feature}
                                                path={`about.programs.programList.${index}.features.${fIndex}`}
                                                as="span"
                                            />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section className={styles.impactSection}>
                <div className={styles.container}>
                    <EditableText
                        value={impactSectionTitle}
                        path="about.impact.sectionTitle"
                        as="h2"
                    />
                    <div className={styles.impactGrid}>
                        {impactCards.map((card: { icon: string; title: string; description: string }, index: number) => (
                            <div key={index} className={styles.impactCard}>
                                <div className={styles.impactIcon}>
                                    <EditableText
                                        value={card.icon}
                                        path={`about.impact.cards.${index}.icon`}
                                        as="span"
                                    />
                                </div>
                                <EditableText
                                    value={card.title}
                                    path={`about.impact.cards.${index}.title`}
                                    as="h3"
                                />
                                <EditableText
                                    value={card.description}
                                    path={`about.impact.cards.${index}.description`}
                                    as="div"
                                    multiline
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Join Us Section */}
            <section className={styles.joinSection}>
                <div className={styles.container}>
                    <div className={styles.joinContent}>
                        <EditableText
                            value={joinTitle}
                            path="about.join.title"
                            as="h2"
                        />
                        <EditableText
                            value={joinDescription}
                            path="about.join.description"
                            as="div"
                            multiline
                        />
                        <div className={styles.joinButtons}>
                            <a href="/contact" className={styles.primaryButton}>
                                <EditableText
                                    value={joinPrimaryButton}
                                    path="about.join.primaryButton"
                                    as="span"
                                />
                            </a>
                            <a href="/sponsors" className={styles.secondaryButton}>
                                <EditableText
                                    value={joinSecondaryButton}
                                    path="about.join.secondaryButton"
                                    as="span"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer/>
        </div>
    )
}