"use client";
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/app/_components/navbar/navbar';
import Footer from '@/app/_components/footer/footer';
import { useContent } from '@/hooks/useContent';
import { formatArticleDate } from '@/utils/formatDate';
import styles from './articlePage.module.scss';
import EditableText from '@/components/editable/EditableText';
import RichContentEditor from '@/components/editable/RichContentEditor';
import StyleEditor from '@/components/editable/StyleEditor';
import MediaAsset from '@/components/media/MediaAsset';
import MediaPickerModal from '@/components/media/MediaPickerModal';
import Icon from '@/components/icons/Icon';
import { useBannerControls } from '@/components/editable/useBannerControls';
import { useEditMode } from '@/contexts/EditModeContext';
import { getContentValue } from '@/utils/contentHelpers';
import { createPortal } from 'react-dom';

export default function ArticlePage() {
    const params = useParams();
    const articleId = params.id as string;
    const { content } = useContent();
    const { isEditMode } = useEditMode();

    const articles = content?.news?.articles || [];
    const articleIndex = articles.findIndex((a) => a.id === articleId);
    const article = articles[articleIndex];

    const articlePath = articleIndex >= 0 ? `news.articles[${articleIndex}]` : 'news.articles[0]';
    const articleImagePath = `${articlePath}.image`;

    const {
        isEditMode: canEditBanner,
        containerRef,
        bannerSrc,
        bannerStyle,
        position,
        isRepositioning,
        setIsRepositioning,
        isDragging,
        showMediaPicker,
        setShowMediaPicker,
        showStyleEditor,
        setShowStyleEditor,
        styleEditorPos,
        openStyleEditorFrom,
        updateBannerStyle,
        updateBannerMedia,
        resetPosition,
        dragHandlers,
    } = useBannerControls({
        content,
        bannerPath: articleImagePath,
        fallbackSrc: '/images/PlaceholderBanner.jpg',
    });

    if (!article && !isEditMode) {
        return (
            <div className={styles.articlePage}>
                <Navbar />
                <div className={styles.notFound}>
                    <h1>Article Not Found</h1>
                    <p>The article you&apos;re looking for doesn&apos;t exist.</p>
                    <Link href="/news">Back to news</Link>
                </div>
                <Footer />
            </div>
        );
    }

    const hasArticleMedia = Boolean(article?.image || bannerSrc !== '/images/PlaceholderBanner.jpg');

    return (
        <div className={styles.articlePage}>
            <Navbar />
            {hasArticleMedia && (
                <div
                    ref={containerRef}
                    className={`${styles.articleBanner} ${isRepositioning ? styles.repositioning : ''} ${isDragging ? styles.dragging : ''}`}
                    {...dragHandlers}
                >
                    <span data-banner-media-wrapper="true" style={{ display: 'contents' }}>
                        <MediaAsset
                            src={bannerSrc}
                            alt=""
                            className={styles.bannerMedia}
                            style={{
                                objectFit: bannerStyle.objectFit || 'cover',
                                objectPosition: bannerStyle.objectPosition || 'center center',
                            }}
                        />
                    </span>
                    {canEditBanner && (
                        <div className={styles.bannerControls} data-banner-control="true">
                            {isRepositioning ? (
                                <div className={styles.repositionBar}>
                                    <span className={styles.repositionHint}>
                                        <Icon name="move" size={14} />
                                        Drag banner ({position.x}% {position.y}%)
                                    </span>
                                    <button type="button" className={styles.bannerBtn} onClick={resetPosition}>
                                        Reset
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.bannerBtn} ${styles.bannerPrimaryBtn}`}
                                        onClick={() => setIsRepositioning(false)}
                                    >
                                        <Icon name="check" size={14} /> Done
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button type="button" className={styles.bannerBtn} onClick={() => setShowMediaPicker(true)}>
                                        <Icon name="image" size={15} /> Change Banner
                                    </button>
                                    <button type="button" className={styles.bannerBtn} onClick={() => setIsRepositioning(true)}>
                                        <Icon name="move" size={15} /> Reposition
                                    </button>
                                    <button type="button" className={styles.bannerBtn} onClick={(e) => openStyleEditorFrom(e.currentTarget)}>
                                        <Icon name="palette" size={15} /> Style
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                    <div className={styles.bannerOverlay} />
                </div>
            )}
            {showMediaPicker && (
                <MediaPickerModal
                    title="Choose Article Banner Media"
                    initialUrl={bannerSrc}
                    category="images"
                    subcategory="articles"
                    onSelect={updateBannerMedia}
                    onClose={() => setShowMediaPicker(false)}
                />
            )}
            {typeof document !== 'undefined' && showStyleEditor && createPortal(
                <StyleEditor
                    type="image"
                    currentStyles={bannerStyle}
                    onStyleChange={updateBannerStyle}
                    onClose={() => setShowStyleEditor(false)}
                    position={styleEditorPos}
                />,
                document.body
            )}
            <div className={styles.articleContainer}>
                <div className={styles.articleHeader}>
                    <div className={styles.headerContent}>
                        <div className={styles.breadcrumb}>
                            <Link href="/news">Back to news</Link>
                        </div>
                        
                        <div 
                            className={styles.categoryBadge}
                            data-category={getContentValue(article?.category) || 'General'}
                        >
                            <EditableText
                                value={getContentValue(article?.category) || 'General'}
                                path={`${articlePath}.category`}
                                as="span"
                            />
                        </div>

                        <h1>
                            <EditableText
                                value={getContentValue(article?.title) || 'Untitled Article'}
                                path={`${articlePath}.title`}
                                as="span"
                            />
                        </h1>

                        <div className={styles.metadata}>
                            <span className={styles.author}>
                                By <EditableText
                                    value={getContentValue(article?.author) || 'Anonymous'}
                                    path={`${articlePath}.author`}
                                    as="span"
                                />
                            </span>
                            <span className={styles.separator}>•</span>
                            <span className={styles.date}>
                                <EditableText
                                    value={isEditMode ? article?.publishDate ?? '' : formatArticleDate(article?.publishDate) || 'No date'}
                                    path={`${articlePath}.publishDate`}
                                    as="span"
                                />
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.articleBody}>
                    <div className={styles.content}>
                        <RichContentEditor
                            content={getContentValue(article?.content) || 'No content available. Click to edit in Edit Mode.'}
                            path={`${articlePath}.content`}
                        />
                    </div>

                    {article?.tags && article.tags.length > 0 && (
                        <div className={styles.tags}>
                            <h3>Tags</h3>
                            <div className={styles.tagList}>
                                {article.tags.map((tag: string, index: number) => (
                                    <span key={index} className={styles.tag}>
                                        <EditableText
                                            value={getContentValue(tag)}
                                            path={`${articlePath}.tags[${index}]`}
                                            as="span"
                                        />
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {article?.link && (
                        <div className={styles.externalLink}>
                            <a 
                                href={article.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.linkButton}
                            >
                                {article.linkText || 'Read original article'}
                            </a>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
