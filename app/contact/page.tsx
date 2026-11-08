"use client";
import React from "react";
import styles from "@/app/contact/contact.module.scss";
import Navbar from "@/app/_components/navbar/navbar";
import Footer from "@/app/_components/footer/footer";
import Title from "@/app/_components/title/title";
import ContactForm from "@/app/_components/contactForm/contactForm";
import img1 from "@/public/images/robotics/contact_bg.jpg";
import { useContent } from "@/hooks/useContent";
import EditableText from "@/components/editable/EditableText";
import EditableIcon from "@/components/icons/EditableIcon";

export default function Contact() {
    const { content } = useContent();
    
    // Default fallback data
    const defaultContactData = {
        hero: {
            title: "Get Connected",
            subtitle: "Join our robotics community or reach out to learn more about our programs"
        },
        mainTitle: "Connect With Oxford Academy Robotics",
        mainDescription: "Whether you're a prospective student, interested sponsor, community member, or fellow robotics enthusiast, we'd love to hear from you. Our teams are always excited to share our passion for STEM education and competitive robotics.",
        highlights: [
            {
                icon: "users",
                title: "Join Our Teams",
                description: "Interested students can apply to join our FRC, FTC, or VEX robotics teams"
            },
            {
                icon: "handshake",
                title: "Partnership Opportunities",
                description: "Explore sponsorship and mentorship opportunities with our organization"
            },
            {
                icon: "graduation",
                title: "Educational Outreach",
                description: "Request demonstrations and workshops for your school or organization"
            }
        ],
        stats: [] as { value: string; label?: string }[],
        contactMethods: {
            title: "How To Reach Us",
            methods: [
                {
                    icon: "mail",
                    title: "Email Us",
                    description: "For general inquiries and information",
                    link: "contact@oarobotics.org",
                    linkType: "email"
                },
                {
                    icon: "phone",
                    title: "Call or Text",
                    description: "Speak directly with our coaching staff",
                    link: "(562) 860-1902",
                    linkType: "phone"
                },
                {
                    icon: "pin",
                    title: "Visit Our Lab",
                    description: "Located on the Oxford Academy campus",
                    address: "5172 Orange Ave\nCypress, CA 90630"
                },
                {
                    icon: "message",
                    title: "Social Media",
                    description: "Follow us for updates and announcements",
                    socials: ["Instagram", "YouTube"]
                }
            ]
        },
        formSection: {
            title: "Send Us A Message",
            description: "Have a specific question or inquiry? Fill out the form below and we'll get back to you within 24 hours."
        }
    };

    // Merge CMS content with defaults, ensuring all arrays exist
    const contactData = {
        hero: content?.contact?.hero || defaultContactData.hero,
        mainTitle: content?.contact?.mainTitle || defaultContactData.mainTitle,
        mainDescription: content?.contact?.mainDescription || defaultContactData.mainDescription,
        highlights: content?.contact?.highlights || defaultContactData.highlights,
        stats: content?.contact?.stats || defaultContactData.stats,
        contactMethods: {
            title: content?.contact?.contactMethods?.title || defaultContactData.contactMethods.title,
            methods: content?.contact?.contactMethods?.methods || defaultContactData.contactMethods.methods
        },
        formSection: content?.contact?.formSection || defaultContactData.formSection
    };

    return (
        <div className={styles.contact}>
            <Navbar />
            <Title 
                title={contactData.hero.title} 
                description={contactData.hero.subtitle}
                img1={img1}
                heroPath="contact.hero"
            />
            
            {/* Contact Hero Section */}
            <section className={styles.contactHero}>
                <div className={styles.container}>
                    <div className={styles.heroContent}>
                        <div className={styles.heroText}>
                            <EditableText
                                value={contactData.mainTitle}
                                path="contact.mainTitle"
                                as="h2"
                            />
                            <EditableText
                                value={contactData.mainDescription}
                                path="contact.mainDescription"
                                as="p"
                                multiline
                            />
                            <div className={styles.contactHighlights}>
                                {contactData.highlights.map((highlight, index) => (
                                    <div key={index} className={styles.highlight}>
                                        <div className={styles.highlightIcon}>
                                            <EditableIcon
                                                value={highlight.icon}
                                                path={`contact.highlights.${index}.icon`}
                                                size={24}
                                            />
                                        </div>
                                        <EditableText
                                            value={highlight.title}
                                            path={`contact.highlights.${index}.title`}
                                            as="h3"
                                        />
                                        <EditableText
                                            value={highlight.description}
                                            path={`contact.highlights.${index}.description`}
                                            as="p"
                                            multiline
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.heroStats}>
                            {contactData.stats.map((stat, index) => (
                                <div key={index} className={styles.statCard}>
                                    <EditableText
                                        value={stat.value}
                                        path={`contact.stats.${index}.value`}
                                        as="h3"
                                    />
                                    {stat.label && (
                                        <EditableText
                                            value={stat.label}
                                            path={`contact.stats.${index}.label`}
                                            as="p"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Methods Section */}
            <section className={styles.contactMethods}>
                <div className={styles.container}>
                    <EditableText
                        value={contactData.contactMethods.title}
                        path="contact.contactMethods.title"
                        as="h2"
                    />
                    <div className={styles.methodsGrid}>
                        {contactData.contactMethods.methods.map((method, index) => (
                            <div key={index} className={styles.methodCard}>
                                <div className={styles.methodIcon}>
                                    <EditableIcon
                                        value={method.icon}
                                        path={`contact.contactMethods.methods.${index}.icon`}
                                        size={24}
                                    />
                                </div>
                                <EditableText
                                    value={method.title}
                                    path={`contact.contactMethods.methods.${index}.title`}
                                    as="h3"
                                />
                                <EditableText
                                    value={method.description}
                                    path={`contact.contactMethods.methods.${index}.description`}
                                    as="p"
                                    multiline
                                />
                                {method.link && (
                                    <a 
                                        href={method.linkType === 'email' ? `mailto:${method.link}` : `tel:${method.link.replace(/[^\d+]/g, '')}`}
                                        className={styles.methodLink}
                                    >
                                        <EditableText
                                            value={method.link}
                                            path={`contact.contactMethods.methods.${index}.link`}
                                            as="span"
                                        />
                                    </a>
                                )}
                                {method.address && (
                                    <div className={styles.methodAddress}>
                                        <EditableText
                                            value={method.address}
                                            path={`contact.contactMethods.methods.${index}.address`}
                                            as="span"
                                            multiline
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className={styles.formSection}>
                <div className={styles.container}>
                    <div className={styles.formWrapper}>
                        <div className={styles.formHeader}>
                            <EditableText
                                value={contactData.formSection.title}
                                path="contact.formSection.title"
                                as="h2"
                            />
                            <EditableText
                                value={contactData.formSection.description}
                                path="contact.formSection.description"
                                as="p"
                                multiline
                            />
                        </div>
                        <ContactForm 
                            title=""
                            subtitle=""
                        />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}