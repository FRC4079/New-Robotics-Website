"use client";
import React from 'react';
import styles from './stats.module.scss';
import { useContent } from '@/hooks/useContent';
import { getContentValue, getContentStyle } from '@/utils/contentHelpers';
import EditableText from '@/components/editable/EditableText';
import EditableIcon from '@/components/icons/EditableIcon';

type Stat = {
    id: string;
    label: string;
    value: string;
    description?: string;
    icon?: string;
}

type StatsProps = {
    children?: React.ReactNode;
    stats?: Stat[];
    title?: string;
}

export default function Stats({ children, stats, title }: StatsProps): React.ReactElement | null {
    const { content } = useContent();

    const displayStats: Stat[] = stats || content?.homepage?.stats?.items || [];
    const displayTitle = title || content?.homepage?.stats?.title || "Our Impact by the Numbers";

    if (displayStats.length === 0) return null;

    return (
        <section id="stats-section" className={styles.stats}>
            <div className={styles.container}>
                <EditableText
                    value={displayTitle}
                    path="homepage.stats.title"
                    as="h2"
                    className={styles.title}
                />

                <div className={styles.statsGrid}>
                    {displayStats.map((stat, index) => (
                        <div key={stat.id} className={styles.statCard}>
                            {stat.icon && (
                                <div className={styles.statIcon}>
                                    <EditableIcon
                                        value={stat.icon}
                                        path={`homepage.stats.items.${index}.icon`}
                                        size={26}
                                    />
                                </div>
                            )}
                            <div className={styles.statValue}>
                                <EditableText
                                    value={getContentValue(stat.value)}
                                    path={`homepage.stats.items.${index}.value`}
                                    as="span"
                                    style={getContentStyle(stat.value)}
                                />
                            </div>
                            <div className={styles.statLabel}>
                                <EditableText
                                    value={getContentValue(stat.label)}
                                    path={`homepage.stats.items.${index}.label`}
                                    as="span"
                                    style={getContentStyle(stat.label)}
                                />
                            </div>
                            {stat.description && (
                                <div className={styles.statDescription}>
                                    <EditableText
                                        value={getContentValue(stat.description)}
                                        path={`homepage.stats.items.${index}.description`}
                                        as="span"
                                        style={getContentStyle(stat.description)}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {children}
        </section>
    );
}
