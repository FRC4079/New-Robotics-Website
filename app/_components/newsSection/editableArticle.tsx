"use client";
import React, { useState } from 'react';
import EditableText from '@/components/editable/EditableText';
import EditableImage from '@/components/editable/EditableImage';
import { useEditMode } from '@/contexts/EditModeContext';
import styles from './editableArticle.module.scss';
import Link from 'next/link';
import Icon from '@/components/icons/Icon';

export type NewsArticle = {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    publishDate: string;
    category: 'Competition' | 'Achievement' | 'Event' | 'General';
    image?: string;
    tags: string[];
    link?: string;
    linkText?: string;
}

type EditableArticleProps = {
    article: NewsArticle;
    basePath: string;
    index: number;
    isFeatured?: boolean;
    onDelete: () => void;
}

export default function EditableArticle({
    article,
    basePath,
    index,
    isFeatured = false,
    onDelete
}: EditableArticleProps): React.ReactElement {
    const { isEditMode } = useEditMode();
    const [showFullContent, setShowFullContent] = useState(false);

    const articlePath = `${basePath}[${index}]`;

    return (
        <article 
            className={`${styles.articleCard} ${isFeatured ? styles.featured : ''} ${!isEditMode ? styles.clickable : ''}`}
        >
            {isEditMode && (
                <button
                    className={styles.deleteButton}
                    onClick={onDelete}
                    title="Delete article"
                >
                    <Icon name="trash" size={16} />
                </button>
            )}
            
            <div className={styles.articleImage}>
                {article.image ? (
                    <EditableImage
                        src={article.image}
                        alt={article.title}
                        path={`${articlePath}.image`}
                        className={styles.image}
                    />
                ) : (
                    isEditMode && (
                        <div className={styles.noImage}>
                            <EditableImage
                                src=""
                                alt="Upload article image"
                                path={`${articlePath}.image`}
                                className={styles.imagePlaceholder}
                            />
                        </div>
                    )
                )}
                <div className={styles.imageOverlay}>
                    <span
                        className={styles.categoryBadge}
                        data-category={article.category}
                    >
                        <EditableText
                            value={article.category}
                            path={`${articlePath}.category`}
                            as="span"
                        />
                    </span>
                </div>
            </div>
            
            <div className={styles.articleContent}>
                <div className={styles.articleMeta}>
                    <span className={styles.author}>
                        <EditableText
                            value={article.author}
                            path={`${articlePath}.author`}
                            as="span"
                        />
                    </span>
                    <span className={styles.date}>
                        <EditableText
                            value={article.publishDate}
                            path={`${articlePath}.publishDate`}
                            as="span"
                            placeholder="YYYY-MM-DD"
                        />
                    </span>
                </div>
                
                <h2>
                    {isEditMode ? (
                        <EditableText
                            value={article.title}
                            path={`${articlePath}.title`}
                            as="span"
                        />
                    ) : (
                        <Link href={`/news/${article.id}`} className={styles.titleLink}>
                            {article.title}
                        </Link>
                    )}
                </h2>
                
                <div className={styles.excerpt}>
                    <EditableText
                        value={article.excerpt}
                        path={`${articlePath}.excerpt`}
                        as="span"
                        multiline
                    />
                </div>
                
                {isEditMode && (
                    <div className={styles.contentEditor}>
                        <button
                            className={styles.toggleContent}
                            onClick={() => setShowFullContent(!showFullContent)}
                        >
                            {showFullContent ? 'Hide full content' : 'Edit full content'}
                        </button>
                        
                        {showFullContent && (
                            <div className={styles.fullContentEditor}>
                                <label>Full Article Content:</label>
                                <EditableText
                                    value={article.content}
                                    path={`${articlePath}.content`}
                                    as="div"
                                    multiline
                                    placeholder="Write the full article content here..."
                                />
                            </div>
                        )}
                    </div>
                )}
                
                <div className={styles.articleTags}>
                    {article.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span key={tagIndex} className={styles.tag}>
                            <EditableText
                                value={tag}
                                path={`${articlePath}.tags[${tagIndex}]`}
                                as="span"
                            />
                        </span>
                    ))}
                </div>
                
                {(article.link || isEditMode) && (
                    <div className={styles.readMoreContainer}>
                        {article.link ? (
                            <a 
                                href={article.link}
                                className={styles.readMore}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <EditableText
                                    value={article.linkText || "Read More"}
                                    path={`${articlePath}.linkText`}
                                    as="span"
                                />
                            </a>
                        ) : (
                            isEditMode && (
                                <div className={styles.readMore}>
                                    <EditableText
                                        value={article.linkText || "Read More"}
                                        path={`${articlePath}.linkText`}
                                        as="span"
                                    />
                                </div>
                            )
                        )}
                        {isEditMode && (
                            <div className={styles.linkEditor}>
                                <label>Link URL:</label>
                                <EditableText
                                    value={article.link || ""}
                                    path={`${articlePath}.link`}
                                    as="span"
                                    placeholder="https://example.com"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}
