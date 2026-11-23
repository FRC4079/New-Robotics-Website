"use client";
import React from "react";
import styles from "@/app/_components/title/title.module.scss";
import { StaticImageData } from "next/image";
import bannerImg from "@/public/images/PlaceholderBanner.jpg";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";
import StyleEditor from "@/components/editable/StyleEditor";
import MediaAsset from "@/components/media/MediaAsset";
import MediaPickerModal from "@/components/media/MediaPickerModal";
import Icon from "@/components/icons/Icon";
import { useBannerControls } from "@/components/editable/useBannerControls";
import { useContent } from "@/hooks/useContent";
import { readContentPath } from "@/utils/contentHelpers";
import { createPortal } from "react-dom";

type TitleProps = {
    children?: React.ReactNode;
    title: string | undefined;
    description: string;
    img1?: StaticImageData;
    img2?: StaticImageData;
    heroPath?: string; // Base path for editable content (e.g., "homepage.hero")
}

export default function Title({
    children,
    title,
    description,
    img1 = bannerImg,
    img2,
    heroPath = "homepage.hero"
}: TitleProps): React.ReactElement {
    const { content } = useContent();

    // Overlay design image: the saved one wins over the default.
    const savedOverlay = readContentPath(content, `${heroPath}.overlayImage`);
    const overlaySrc = typeof savedOverlay === 'string' && savedOverlay ? savedOverlay : img2?.src;

    const bannerPath = `${heroPath}.bannerImage`;
    const {
        isEditMode,
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
        bannerPath,
        fallbackSrc: img1.src,
    });

    const mediaStyle: React.CSSProperties = {
        objectFit: bannerStyle.objectFit || "cover",
        objectPosition: bannerStyle.objectPosition || "center center",
    };

    return (
        <div
            ref={containerRef}
            className={`${styles.top} ${isRepositioning ? styles.repositioning : ""} ${isDragging ? styles.dragging : ""}`}
            {...dragHandlers}
        >
            <div className={styles.mediaLayer} aria-hidden="true">
                <span data-banner-media-wrapper="true" style={{ display: 'contents' }}>
                    <MediaAsset
                        src={bannerSrc}
                        alt=""
                        className={styles.mediaBackground}
                        style={mediaStyle}
                    />
                </span>
            </div>

            <div className={`${styles.overlay} ${isRepositioning ? styles.overlayDimmed : ""}`}>
                {isEditMode && (
                    <div className={styles.bannerEditor} data-banner-control="true">
                        {isRepositioning ? (
                            <div className={styles.repositionBar}>
                                <span className={styles.repositionHint}>
                                    <Icon name="move" size={14} />
                                    Drag banner image to position ({position.x}% {position.y}%)
                                </span>
                                <button
                                    type="button"
                                    className={styles.bannerEditButton}
                                    onClick={resetPosition}
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.bannerEditButton} ${styles.bannerPrimaryButton}`}
                                    onClick={() => setIsRepositioning(false)}
                                >
                                    <Icon name="check" size={14} /> Done
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className={styles.bannerEditButton}
                                    onClick={() => setShowMediaPicker(true)}
                                    title="Change banner image, GIF, or video"
                                >
                                    <Icon name="image" size={16} />
                                    <span>Change Banner</span>
                                </button>
                                <button
                                    type="button"
                                    className={styles.bannerEditButton}
                                    onClick={() => setIsRepositioning(true)}
                                    title="Drag background up or down to reposition"
                                >
                                    <Icon name="move" size={16} />
                                    <span>Reposition</span>
                                </button>
                                <button
                                    type="button"
                                    className={styles.bannerEditButton}
                                    onClick={(e) => openStyleEditorFrom(e.currentTarget)}
                                    title="Edit banner style properties"
                                >
                                    <Icon name="palette" size={16} />
                                    <span>Style</span>
                                </button>
                            </>
                        )}
                    </div>
                )}
                {img2 !== undefined && (
                    <EditableImage
                        src={overlaySrc ?? img2.src}
                        alt=""
                        path={`${heroPath}.overlayImage`}
                        className={styles.overlayImage}
                    />
                )}
                <EditableText
                    value={title || "OXFORD ACADEMY ROBOTICS"}
                    path={`${heroPath}.title`}
                    as="h1"
                />
                <EditableText
                    value={description}
                    path={`${heroPath}.subtitle`}
                    as="p"
                />
                {children && <div className={styles.extra}>{children}</div>}
            </div>

            {showMediaPicker && (
                <MediaPickerModal
                    title="Choose Banner Image, GIF, or Video"
                    initialUrl={bannerSrc}
                    category="images"
                    subcategory="banners"
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
        </div>
    );
}
