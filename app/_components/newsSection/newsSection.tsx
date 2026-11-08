"use client";
import React from 'react';
import styles from './newsSection.module.scss';
import EditableArticle, { NewsArticle } from './editableArticle';
import { useEditMode } from '@/contexts/EditModeContext';
import Icon from '@/components/icons/Icon';

type NewsSectionProps = {
    children?: React.ReactNode;
    articles?: NewsArticle[];
    title?: string;
    showAll?: boolean;
    maxArticles?: number;
}

const createNewArticle = (id: string): NewsArticle => ({
    id,
    title: 'New Article Title',
    excerpt: 'Click to edit this excerpt. Provide a brief summary of your article.',
    content: 'Full article content goes here...',
    author: 'Author Name',
    publishDate: new Date().toISOString().split('T')[0],
    category: 'General',
    image: '',
    tags: ['Tag1', 'Tag2', 'Tag3'],
    link: '',
    linkText: 'Read More'
});

export default function NewsSection({ 
    children, 
    articles = [],
    title = "Latest News",
    showAll = false,
    maxArticles = 3
}: NewsSectionProps): React.ReactElement {
    const { isEditMode, addPendingChange } = useEditMode();
    const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
    const [localArticles, setLocalArticles] = React.useState<NewsArticle[]>(articles);

    // Update local articles when prop changes
    React.useEffect(() => {
        setLocalArticles(articles);
    }, [articles]);

    const categories = ['All', 'Competition', 'Achievement', 'Event', 'General'];

    const filteredArticles = React.useMemo(() => {
        let filtered = selectedCategory === 'All' 
            ? localArticles 
            : localArticles.filter(article => article.category === selectedCategory);
        
        if (!showAll) {
            filtered = filtered.slice(0, maxArticles);
        }
        
        return filtered;
    }, [selectedCategory, localArticles, showAll, maxArticles]);

    const handleAddArticle = () => {
        const newId = `article-${Date.now()}`;
        const newArticle = createNewArticle(newId);
        const updatedArticles = [...localArticles, newArticle];
        setLocalArticles(updatedArticles);
        addPendingChange('news.articles', updatedArticles);
    };

    const handleDeleteArticle = (index: number) => {
        if (confirm('Are you sure you want to delete this article?')) {
            const updatedArticles = localArticles.filter((_, i) => i !== index);
            setLocalArticles(updatedArticles);
            addPendingChange('news.articles', updatedArticles);
        }
    };

    return (
        <section className={styles.newsSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    
                    <div className={styles.headerActions}>
                        {showAll && (
                            <div className={styles.filterTabs}>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        className={`${styles.filterTab} ${selectedCategory === category ? styles.active : ''}`}
                                        aria-pressed={selectedCategory === category}
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        {isEditMode && (
                            <button
                                className={styles.addButton}
                                onClick={handleAddArticle}
                                title="Add new article"
                            >
                                <Icon name="plus" size={16} /> Add article
                            </button>
                        )}
                    </div>
                </div>

                {filteredArticles.length === 0 ? (
                    <div className={styles.noArticles}>
                        <p>No articles found{selectedCategory !== 'All' ? ` for ${selectedCategory}` : ''}.</p>
                        {isEditMode && (
                            <button
                                className={styles.addFirstButton}
                                onClick={handleAddArticle}
                            >
                                <Icon name="plus" size={16} /> Add your first article
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={styles.articlesGrid}>
                        {filteredArticles.map((article, index) => {
                            // Find the original index in localArticles for proper path
                            const originalIndex = localArticles.findIndex(a => a.id === article.id);
                            return (
                                <EditableArticle
                                    key={article.id}
                                    article={article}
                                    basePath="news.articles"
                                    index={originalIndex}
                                    isFeatured={index === 0 && showAll}
                                    onDelete={() => handleDeleteArticle(originalIndex)}
                                />
                            );
                        })}
                    </div>
                )}

                {!showAll && localArticles.length > maxArticles && (
                    <div className={styles.viewAll}>
                        <button className={styles.viewAllBtn}>
                            View All News ({localArticles.length} articles)
                        </button>
                    </div>
                )}
            </div>
            {children}
        </section>
    );
}
