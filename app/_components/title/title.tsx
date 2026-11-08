"use client";
import React from "react";
import styles from "@/app/_components/title/title.module.scss";
import {StaticImageData} from "next/image";
import bannerImg from "@/public/images/PlaceholderBanner.jpg";
import {TW_900} from "@/utils/globalFonts";
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
    bgMoveUp?: number;
    bgShift?: number;
    heroPath?: string; // Base path for editable content (e.g., "homepage.hero")
}

export default function Title({
                                  children,
                                  title,
                                  description,
                                  img1 = bannerImg,
                                  img2,
                                  bgMoveUp = 5,
                                  bgShift = 0,
                                  heroPath = "homepage.hero"
                              }: TitleProps): React.ReactElement {
    const [textToType, setTextToType] = React.useState<string>("");
    const [bgParallax, setBgParallax] = React.useState<number>(0);
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

    // Convert objectPosition style to backgroundPosition
    let backgroundPosition = `center ${bgParallax * -0.5 - bgShift}px`;
    if (bannerStyle.objectPosition) {
        // objectPosition format: "50% 50%" or "center center"
        // Extract just the position values without parallax for styled banners
        backgroundPosition = bannerStyle.objectPosition;
    } else if (!isEditMode) {
        // Only apply parallax if no custom position is set and not in edit mode
        backgroundPosition = `center ${bgParallax * -0.5 - bgShift}px`;
    }

    // Map objectFit to backgroundSize
    let backgroundSize = "cover";
    if (bannerStyle.objectFit) {
        switch (bannerStyle.objectFit) {
            case 'contain':
                backgroundSize = 'contain';
                break;
            case 'fill':
                backgroundSize = '100% 100%';
                break;
            case 'none':
                backgroundSize = 'auto';
                break;
            case 'scale-down':
                backgroundSize = 'contain';
                break;
            default:
                backgroundSize = 'cover';
        }
    }

    // Make a parallax effect with the background image (zoom in the background image to make it possible)
    const styleBanner: React.CSSProperties = {
        backgroundPosition: backgroundPosition,
        backgroundSize: backgroundSize,
        backgroundImage: `url(${bannerSrc})`,
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
    }

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

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
            alert('Failed to upload banner image');
        }
    };

    React.useEffect((): () => void => {
        const handleScroll: () => void = (): void => {
            setBgParallax(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return (): void => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [bgMoveUp]);


    React.useEffect((): void => {
        let i: number = 0;
        const text: string = description;
        const speed: number = 75; // Lower is faster
        const interval: NodeJS.Timeout = setInterval((): void => {
            // setTimeout((): void => {
                if (i < text.length) {
                    setTextToType(text.substring(0, i + 1));
                    i++;
                } else {
                    clearInterval(interval);
                }
            // }, 750);
        }, speed);
    }, [description]);
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
                            style={{ display: 'none' }}
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
                    className={TW_900}
                />
                <EditableText
                    value={textToType}
                    path={`${heroPath}.subtitle`}
                    as="p"
                    className={TW_900}
                />
                <h2 className={TW_900}>{children}</h2>
            </div>
        </div>
    );
}