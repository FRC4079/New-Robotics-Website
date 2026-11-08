"use client";
import React from "react";
import styles from "@/app/_components/title/title.module.scss";
import {StaticImageData} from "next/image";
import bannerImg from "@/public/images/PlaceholderBanner.jpg";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";
import { useContent } from "@/hooks/useContent";
import { useEditMode } from "@/contexts/EditModeContext";

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
    const [uploadError, setUploadError] = React.useState<string>("");
    const { content } = useContent();
    const { isEditMode, addPendingChange } = useEditMode();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Get the banner image from content or use default
    const bannerPath = `${heroPath}.bannerImage`;
    const pathParts = bannerPath.split('.');
    let bannerValue: any = content;
    for (const part of pathParts) {
        bannerValue = bannerValue?.[part];
    }
    
    // Extract src and style from bannerValue
    let bannerSrc = img1.src;
    let bannerStyle: any = {};
    
    if (bannerValue) {
        if (typeof bannerValue === 'string') {
            bannerSrc = bannerValue;
        } else if (typeof bannerValue === 'object') {
            bannerSrc = bannerValue.src || img1.src;
            bannerStyle = bannerValue.style || {};
        }
    }

    // Saved crop position (objectPosition) maps onto the CSS background position.
    const backgroundPosition: string = bannerStyle.objectPosition || "center";

    const backgroundSizes: Record<string, string> = {
        contain: "contain",
        "scale-down": "contain",
        fill: "100% 100%",
        none: "auto",
    };
    const backgroundSize: string = backgroundSizes[bannerStyle.objectFit as string] ?? "cover";

    const styleBanner: React.CSSProperties = {
        backgroundImage: `url(${bannerSrc})`,
        backgroundPosition,
        backgroundSize,
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError("");
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', 'images');
            formData.append('subcategory', 'banners');

            const response = await fetch('/api/media', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            
            // Update the banner image in content
            addPendingChange(bannerPath, { src: data.filePath });
        } catch (error) {
            console.error('Error uploading banner:', error);
            setUploadError('Banner upload failed. Please try again.');
        }
    };

    return (
        <div className={styles.top} style={styleBanner}>
            <div className={styles.overlay}>
                {isEditMode && (
                    <div className={styles.bannerEditor}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleBannerUpload}
                            className={styles.hiddenInput}
                            hidden
                        />
                        <button
                            className={styles.bannerEditButton}
                            onClick={() => fileInputRef.current?.click()}
                            title="Change Banner Image"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                            <span>Change Banner</span>
                        </button>
                        
                        {uploadError && <p className={styles.uploadError} role="alert">{uploadError}</p>}

                        {/* Small preview for style editing */}
                        <div className={styles.bannerPreview}>
                            <EditableImage
                                src={bannerSrc}
                                alt="Banner Background"
                                path={bannerPath}
                                width={80}
                                height={50}
                                className={styles.previewImage}
                            />
                            <span className={styles.previewLabel}>Edit Style</span>
                        </div>
                    </div>
                )}
                {
                    img2 !== undefined &&
                    <EditableImage
                        src={img2.src}
                        alt="Oxford Academy Robotics Overlay Design"
                        path={`${heroPath}.overlayImage`}
                        className={styles.overlayImage}
                    />
                }
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
        </div>
    );
}