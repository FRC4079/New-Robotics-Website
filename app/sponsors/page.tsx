"use client";
import React from "react";
import styles from '@/app/sponsors/sponsors.module.scss';
import Navbar from "@/app/_components/navbar/navbar";
import Title from "@/app/_components/title/title";
import Footer from "@/app/_components/footer/footer";
import ContactForm from "@/app/_components/contactForm/contactForm";
import img1 from "@/public/images/robotics/sponsors_bg.jpg";
import { useContent } from "@/hooks/useContent";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";
import EditableIcon from "@/components/icons/EditableIcon";
import { getContentValue } from "@/utils/contentHelpers";

export default function Sponsor() {
    const { content } = useContent();
    
    const defaultSponsorsData = {
        hero: {
            title: "Building the Future Together",
            description: "Our sponsors are more than funders—they are partners in our mission to inspire the next generation of innovators, engineers, and problem-solvers. Through their generous support, we can provide world-class robotics education and compete at the highest levels.",
            stats: [
                { value: "$50K+", label: "Annual Support" },
                { value: "15+", label: "Corporate Partners" },
                { value: "200+", label: "Students Impacted" }
            ]
        },
        currentSponsors: {
            title: "Our Current Sponsors",
            intro: "We're grateful to partner with these incredible organizations who share our commitment to STEM education and innovation.",
            tiers: [
                {
                    name: "Title Sponsors",
                    sponsors: [
                        {
                            name: "Gene Haas Foundation",
                            logo: "/logos/sponsors/gene-haas-foundation.png",
                            description: "Leading supporter of STEM education and workforce development"
                        }
                    ]
                },
                {
                    name: "Gold Sponsors",
                    sponsors: [
                        {
                            name: "NASA",
                            logo: "/logos/sponsors/nasa.png",
                            description: "Inspiring space exploration and STEM innovation"
                        },
                        {
                            name: "Disney",
                            logo: "/logos/sponsors/disney.png",
                            description: "Creating magical learning experiences"
                        }
                    ]
                },
                {
                    name: "Silver Sponsors",
                    sponsors: [
                        {
                            name: "SolidWorks",
                            logo: "/logos/sponsors/solidworks.png",
                            description: "Professional CAD software for design innovation"
                        },
                        {
                            name: "JPL",
                            logo: "/logos/sponsors/jpl.png",
                            description: "Advancing space exploration and technology"
                        },
                        {
                            name: "Emerson",
                            logo: "/logos/sponsors/emerson.png",
                            description: "Engineering solutions for a better world"
                        }
                    ]
                }
            ]
        },
        howSponsorsHelp: {
            title: "How Our Sponsors Make a Difference",
            cards: [
                {
                    icon: "wrench",
                    title: "Equipment & Materials",
                    description: "Sponsors provide cutting-edge tools, raw materials, and manufacturing resources that enable us to build competitive robots and prototype innovative solutions."
                },
                {
                    icon: "target",
                    title: "Competition Funding",
                    description: "Travel expenses, registration fees, and competition costs are covered by our generous sponsors, allowing us to compete at regional and national levels."
                },
                {
                    icon: "users",
                    title: "Mentorship & Expertise",
                    description: "Industry professionals from sponsor companies provide invaluable mentorship, sharing real-world engineering experience with our students."
                },
                {
                    icon: "lightbulb",
                    title: "Educational Resources",
                    description: "Sponsors provide access to professional software, online learning platforms, and educational workshops that enhance our curriculum."
                }
            ]
        },
        opportunities: {
            title: "Partner With Us",
            description: "Join our mission to inspire the next generation of innovators. Your support directly impacts student learning and helps build tomorrow's engineering workforce.",
            benefits: {
                title: "Partnership Benefits:",
                items: [
                    "Brand visibility at competitions and events",
                    "Access to talented student interns",
                    "Corporate social responsibility impact",
                    "Networking with other industry leaders",
                    "Tax-deductible charitable contribution"
                ]
            },
            tiers: {
                title: "Sponsorship Levels:",
                levels: [
                    { amount: "$10,000+", level: "Title Sponsor" },
                    { amount: "$5,000+", level: "Gold Sponsor" },
                    { amount: "$2,500+", level: "Silver Sponsor" },
                    { amount: "$1,000+", level: "Bronze Sponsor" }
                ]
            },
            image: {
                src: "/images/robotics/group.jpeg",
                alt: "Team collaboration",
                caption: {
                    title: "Your support in action",
                    description: "See how sponsorship directly impacts student learning and competition success"
                }
            }
        },
        contact: {
            title: "Ready to Partner?",
            description: "Contact us to discuss sponsorship opportunities and learn more about how your organization can support our mission.",
            details: [
                { label: "Email:", value: "sponsors@oarobotics.com" },
                { label: "Phone:", value: "(714) 220-4055" },
                { label: "Address:", value: "5172 Orange Ave, Cypress, CA 90630" }
            ]
        }
    };

    // Deep merge content with defaults to ensure all nested objects exist
    const sponsorsData = {
        hero: {
            ...defaultSponsorsData.hero,
            ...(content?.sponsors?.hero || {})
        },
        currentSponsors: {
            ...defaultSponsorsData.currentSponsors,
            ...(content?.sponsors?.currentSponsors || {})
        },
        howSponsorsHelp: {
            ...defaultSponsorsData.howSponsorsHelp,
            ...(content?.sponsors?.howSponsorsHelp || {})
        },
        opportunities: {
            ...defaultSponsorsData.opportunities,
            ...(content?.sponsors?.opportunities || {}),
            benefits: {
                ...defaultSponsorsData.opportunities.benefits,
                ...(content?.sponsors?.opportunities?.benefits || {})
            },
            tiers: {
                ...defaultSponsorsData.opportunities.tiers,
                ...(content?.sponsors?.opportunities?.tiers || {})
            },
            image: {
                ...defaultSponsorsData.opportunities.image,
                ...(content?.sponsors?.opportunities?.image || {}),
                caption: {
                    ...defaultSponsorsData.opportunities.image.caption,
                    ...(content?.sponsors?.opportunities?.image?.caption || {})
                }
            }
        },
        contact: {
            ...defaultSponsorsData.contact,
            ...(content?.sponsors?.contact || {})
        }
    };

    return (
        <div className={styles.sponsors}>
            <Navbar isFixed={true}/>
            <Title 
                title={content?.sponsors?.banner?.title ?? "Our Amazing Sponsors"}
                description={content?.sponsors?.banner?.subtitle ?? "Partnerships that power innovation"}
                img1={img1}
                heroPath="sponsors.banner"
            />
            
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.container}>
                    <div className={styles.heroContent}>
                        <EditableText
                            value={sponsorsData.hero.title}
                            path="sponsors.hero.title"
                            as="h2"
                        />
                        <EditableText
                            value={sponsorsData.hero.description}
                            path="sponsors.hero.description"
                            as="p"
                            multiline
                        />
                        <div className={styles.impactStats}>
                            {sponsorsData.hero.stats.map((stat, index) => {
                                // Ensure stat is an object with default values if null/undefined
                                const safestat = stat || { value: '', label: '' };
                                return (
                                    <div key={index} className={styles.stat}>
                                        <EditableText
                                            value={getContentValue(safestat.value) || ''}
                                            path={`sponsors.hero.stats.${index}.value`}
                                            as="h3"
                                        />
                                        <EditableText
                                            value={getContentValue(safestat.label) || ''}
                                            path={`sponsors.hero.stats.${index}.label`}
                                            as="p"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Current Sponsors */}
            <section className={styles.currentSponsors}>
                <div className={styles.container}>
                    <EditableText
                        value={sponsorsData.currentSponsors.title}
                        path="sponsors.currentSponsors.title"
                        as="h2"
                    />
                    <EditableText
                        value={sponsorsData.currentSponsors.intro}
                        path="sponsors.currentSponsors.intro"
                        as="p"
                        className={styles.sponsorIntro}
                        multiline
                    />
                    <div className={styles.sponsorTiers}>
                        {(sponsorsData.currentSponsors.tiers || []).map((tier, tierIndex) => {
                            const safeTier = tier || { name: '', sponsors: [] };
                            return (
                                <div key={tierIndex} className={styles.tier}>
                                    <EditableText
                                        value={safeTier.name}
                                        path={`sponsors.currentSponsors.tiers.${tierIndex}.name`}
                                        as="h3"
                                        className={styles.tierTitle}
                                    />
                                    <div className={styles.sponsorGrid}>
                                        {(safeTier.sponsors || []).map((sponsor, sponsorIndex) => {
                                            const safeSponsor = sponsor || { logo: '', name: '', description: '' };
                                            return (
                                                <div key={sponsorIndex} className={styles.sponsorCard}>
                                                    <div className={styles.sponsorLogo}>
                                                        <EditableImage
                                                            src={safeSponsor.logo}
                                                            alt={safeSponsor.name}
                                                            path={`sponsors.currentSponsors.tiers.${tierIndex}.sponsors.${sponsorIndex}.logo`}
                                                        />
                                                    </div>
                                                    <div className={styles.sponsorInfo}>
                                                        <EditableText
                                                            value={safeSponsor.name}
                                                            path={`sponsors.currentSponsors.tiers.${tierIndex}.sponsors.${sponsorIndex}.name`}
                                                            as="h4"
                                                        />
                                                        <EditableText
                                                            value={safeSponsor.description}
                                                            path={`sponsors.currentSponsors.tiers.${tierIndex}.sponsors.${sponsorIndex}.description`}
                                                            as="p"
                                                            multiline
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How Sponsors Help */}
            <section className={styles.howSponsorsHelp}>
                <div className={styles.container}>
                    <EditableText
                        value={sponsorsData.howSponsorsHelp.title}
                        path="sponsors.howSponsorsHelp.title"
                        as="h2"
                    />
                    <div className={styles.helpGrid}>
                        {(sponsorsData.howSponsorsHelp.cards || []).map((card, index) => {
                            const safeCard = card || { icon: '', title: '', description: '' };
                            return (
                                <div key={index} className={styles.helpCard}>
                                    <div className={styles.helpIcon}>
                                        <EditableIcon
                                            value={safeCard.icon}
                                            path={`sponsors.howSponsorsHelp.cards.${index}.icon`}
                                            size={26}
                                        />
                                    </div>
                                    <EditableText
                                        value={safeCard.title}
                                        path={`sponsors.howSponsorsHelp.cards.${index}.title`}
                                        as="h3"
                                    />
                                    <EditableText
                                        value={safeCard.description}
                                        path={`sponsors.howSponsorsHelp.cards.${index}.description`}
                                        as="p"
                                        multiline
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Sponsorship Opportunities */}
            <section className={styles.sponsorshipOpportunities}>
                <div className={styles.container}>
                    <div className={styles.opportunityContent}>
                        <div className={styles.opportunityText}>
                            <EditableText
                                value={sponsorsData.opportunities.title}
                                path="sponsors.opportunities.title"
                                as="h2"
                            />
                            <EditableText
                                value={sponsorsData.opportunities.description}
                                path="sponsors.opportunities.description"
                                as="p"
                                multiline
                            />
                            
                            <div className={styles.benefitsList}>
                                <EditableText
                                    value={sponsorsData.opportunities.benefits.title}
                                    path="sponsors.opportunities.benefits.title"
                                    as="h3"
                                />
                                <ul>
                                    {(sponsorsData.opportunities.benefits.items || []).map((item, index) => (
                                        <li key={index}>
                                            <EditableText
                                                value={item || ''}
                                                path={`sponsors.opportunities.benefits.items.${index}`}
                                                as="span"
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className={styles.sponsorshipTiers}>
                                <EditableText
                                    value={sponsorsData.opportunities.tiers.title}
                                    path="sponsors.opportunities.tiers.title"
                                    as="h3"
                                />
                                <div className={styles.tierList}>
                                    {(sponsorsData.opportunities.tiers.levels || []).map((tier, index) => {
                                        const safeTier = tier || { amount: '', level: '' };
                                        return (
                                            <div key={index} className={styles.tierOption}>
                                                <span className={styles.tierAmount}>
                                                    <EditableText
                                                        value={safeTier.amount}
                                                        path={`sponsors.opportunities.tiers.levels.${index}.amount`}
                                                        as="span"
                                                    />
                                                </span>
                                                <span className={styles.tierLevel}>
                                                    <EditableText
                                                        value={safeTier.level}
                                                        path={`sponsors.opportunities.tiers.levels.${index}.level`}
                                                        as="span"
                                                    />
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        
                        <div className={styles.opportunityImage}>
                            <div className={styles.imageCard}>
                                <EditableImage
                                    src={sponsorsData.opportunities.image.src}
                                    alt={sponsorsData.opportunities.image.alt}
                                    path="sponsors.opportunities.image.src"
                                />
                                <div className={styles.imageCaption}>
                                    <EditableText
                                        value={sponsorsData.opportunities.image.caption.title}
                                        path="sponsors.opportunities.image.caption.title"
                                        as="h4"
                                    />
                                    <EditableText
                                        value={sponsorsData.opportunities.image.caption.description}
                                        path="sponsors.opportunities.image.caption.description"
                                        as="p"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className={styles.contactSection}>
                <div className={styles.container}>
                    <div className={styles.contactContent}>
                        <div className={styles.contactInfo}>
                            <EditableText
                                value={sponsorsData.contact.title}
                                path="sponsors.contact.title"
                                as="h2"
                            />
                            <EditableText
                                value={sponsorsData.contact.description}
                                path="sponsors.contact.description"
                                as="p"
                                multiline
                            />
                            <div className={styles.contactDetails}>
                                {(sponsorsData.contact.details || []).map((detail, index) => {
                                    const safeDetail = detail || { label: '', value: '' };
                                    return (
                                        <div key={index} className={styles.contactItem}>
                                            <strong>
                                                <EditableText
                                                    value={safeDetail.label}
                                                    path={`sponsors.contact.details.${index}.label`}
                                                    as="span"
                                                />
                                            </strong>
                                            {" "}
                                            <EditableText
                                                value={safeDetail.value}
                                                path={`sponsors.contact.details.${index}.value`}
                                                as="span"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className={styles.formContainer}>
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </section>
            
            <Footer/>
        </div>
    );
}
