"use client";
import React from 'react';
import styles from './contactForm.module.scss';
import Icon from '@/components/icons/Icon';

type ContactFormProps = {
    children?: React.ReactNode;
    title?: string;
    subtitle?: string;
}

type FormData = {
    name: string;
    email: string;
    subject: string;
    message: string;
    formType: 'general' | 'sponsorship' | 'join' | 'media';
}

export default function ContactForm({ 
    children, 
    title = "Get In Touch",
    subtitle = "Have a question or want to get involved? We'd love to hear from you!"
}: ContactFormProps): React.ReactElement {
    const [formData, setFormData] = React.useState<FormData>({
        name: '',
        email: '',
        subject: '',
        message: '',
        formType: 'general'
    });

    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    // Hidden from people; bots tend to fill every field they find.
    const [honeypot, setHoneypot] = React.useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, website: honeypot }),
            });
            const result = await response.json().catch(() => null);
            if (!response.ok || !result?.success) {
                setSubmitError(result?.error || 'Your message could not be sent. Please try again.');
                return;
            }

            setIsSubmitted(true);

            // Reset form after successful submission
            setTimeout(() => {
                setIsSubmitted(false);
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: '',
                    formType: 'general'
                });
            }, 3000);
        } catch {
            setSubmitError('Your message could not be sent. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formTypes = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'sponsorship', label: 'Sponsorship' },
        { value: 'join', label: 'Join Our Team' },
        { value: 'media', label: 'Media Request' }
    ];

    if (isSubmitted) {
        return (
            <section className={styles.contactForm}>
                <div className={styles.container}>
                    <div className={styles.successMessage} role="status">
                        <div className={styles.successIcon}><Icon name="check" size={28} /></div>
                        <h2>Thank you!</h2>
                        <p>Your message has been sent successfully. We&apos;ll get back to you soon!</p>
                    </div>
                </div>
                {children}
            </section>
        );
    }

    return (
        <section className={styles.contactForm}>
            <div className={styles.container}>
                {(title || subtitle) && (
                    <div className={styles.formHeader}>
                        {title && <h2 className={styles.title}>{title}</h2>}
                        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                    </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="name">Full Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                autoComplete="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="Your full name"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Email Address *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                autoComplete="email"
                                inputMode="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="formType">Inquiry Type *</label>
                            <select
                                id="formType"
                                name="formType"
                                value={formData.formType}
                                onChange={handleInputChange}
                                required
                            >
                                {formTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="subject">Subject *</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                autoComplete="off"
                                value={formData.subject}
                                onChange={handleInputChange}
                                required
                                placeholder="What is this about?"
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="message">Message *</label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            rows={6}
                            placeholder="Tell us a little more…"
                        ></textarea>
                    </div>

                    <div className={styles.honeypot} aria-hidden="true">
                        <label htmlFor="website">Leave this field empty</label>
                        <input
                            type="text"
                            id="website"
                            name="website"
                            tabIndex={-1}
                            autoComplete="off"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                        />
                    </div>

                    {submitError && (
                        <p className={styles.errorMessage} role="alert">{submitError}</p>
                    )}

                    <div className={styles.formActions}>
                        <button 
                            type="submit" 
                            className={styles.submitBtn}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className={styles.spinner} aria-hidden="true" />
                                    Sending…
                                </>
                            ) : (
                                <>Send message <Icon name="arrow-right" size={18} /></>
                            )}
                        </button>
                    </div>
                </form>

                <div className={styles.contactInfo}>
                    <div className={styles.infoItem}>
                        <h3>Quick Response</h3>
                        <p>We typically respond within 24 hours during school days.</p>
                    </div>
                    <div className={styles.infoItem}>
                        <h3>Alternative Contact</h3>
                        <p>Email us directly at <a href="mailto:contact@oarobotics.org">contact@oarobotics.org</a></p>
                    </div>
                </div>
            </div>
            {children}
        </section>
    );
}
