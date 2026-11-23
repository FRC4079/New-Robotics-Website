export type AnimationPreset = 'none' | 'subtle' | 'smooth' | 'dynamic' | 'snappy';
export type ScrollRevealType =
  | 'none'
  | 'fade'
  | 'fade-up'
  | 'fade-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'flip-up';
export type HeroEntranceType = 'none' | 'rise' | 'fade' | 'slide-left' | 'zoom' | 'stagger';
export type CardHoverType = 'none' | 'lift' | 'glow' | 'scale' | 'tilt';
export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type ElementAnimationType =
  | 'inherit'
  | 'none'
  | 'fade'
  | 'fade-up'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'float'
  | 'pulse';

export interface SiteAnimationSettings {
  preset: AnimationPreset;
  scrollReveal: ScrollRevealType;
  heroEntrance: HeroEntranceType;
  cardHover: CardHoverType;
  speed: AnimationSpeed;
  stagger: boolean;
  staggerDelayMs?: number;
  respectReducedMotion: boolean;
}

// Style properties for images
export interface ImageStyle {
  width?: string;
  height?: string;
  borderRadius?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string; // e.g., 'center', 'top', 'bottom', 'left', 'right', '50% 50%'
  animation?: ElementAnimationType;
}

// Style properties for text
export interface TextStyle {
  color?: string;
  fontSize?: string;
  fontFamily?: 'Titillium Web' | 'Montserrat' | 'Arial' | 'Helvetica' | 'sans-serif';
  fontWeight?: '300' | '400' | '500' | '600' | '700' | '900';
  lineHeight?: string;
  whiteSpace?: 'normal' | 'pre-line' | 'pre-wrap';
  animation?: ElementAnimationType;
}

export type CustomSectionType =
  | 'text-media'
  | 'cards'
  | 'stats'
  | 'media-showcase'
  | 'cta'
  | 'rich-text';

export interface CustomSectionStyle {
  surface?: 'default' | 'raised' | 'accent-glow' | 'custom';
  customBackground?: string;
  padding?: 'compact' | 'normal' | 'spacious';
  maxWidth?: 'narrow' | 'standard' | 'wide';
  textAlign?: 'left' | 'center';
  mediaPosition?: 'left' | 'right';
  columns?: 2 | 3 | 4;
  cardStyle?: 'glass' | 'solid' | 'minimal';
  accentColor?: string;
  titleColor?: string;
  textColor?: string;
  animation?: 'inherit' | 'none' | 'fade' | 'fade-up' | 'slide-left' | 'slide-right' | 'zoom-in';
}

export interface CustomSectionItem {
  id: string;
  icon?: string;
  value?: string;
  title: string;
  description: string;
  media?: string;
  linkLabel?: string;
  linkHref?: string;
}

export interface CustomSection {
  id: string;
  type: CustomSectionType;
  placement?: 'after-hero' | 'before-footer';
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body?: string;
  media?: string;
  mediaAlt?: string;
  mediaCaption?: string;
  primaryButton?: { label: string; href: string };
  secondaryButton?: { label: string; href: string };
  items?: CustomSectionItem[];
  style?: CustomSectionStyle;
}

export interface CustomPage {
  slug: string;
  title: string;
  description?: string;
  published?: boolean;
  heroStyle?: 'banner' | 'minimal';
  hero: {
    title: string;
    subtitle: string;
    bannerImage?: string | { src: string; style?: ImageStyle };
  };
  theme?: {
    accentColor?: string;
    backgroundTint?: string;
  };
  sections: CustomSection[];
}

export interface SiteContent {
  /** Text and image styles for fields stored as plain values, keyed by dotted path. */
  _styles?: Record<string, TextStyle & ImageStyle>;
  /** Extra sections added by admins to built-in pages, keyed by page name. */
  pageSections?: Record<string, CustomSection[]>;
  site: {
    title: string;
    tagline: string;  
    description: string;
    keywords: string;
    logo: string;
    logoAlt: string;
    organizationName: string;
    organizationFullName?: string;
    animations?: SiteAnimationSettings;
  };
  customPages?: Record<string, CustomPage>;
  homepage: {
    hero: {
      title: string;
      subtitle: string;
      backgroundImage: string;
      overlayImage: string;
    };
    aboutBrief: {
      title: string;
      description: string;
      image: string;
      imageStyle?: ImageStyle;
      textStyle?: TextStyle;
    };
    stats: {
      title: string;
      items: Array<{
        id: string;
        label: string;
        value: string;
        description: string;
        icon: string;
      }>;
    };
    goals: {
      title: string;
      description: string;
      slogans: Array<{
        id: string;
        text: string;
        image: string;
      }>;
    };
  };
  navigation: {
    items: Array<{
      name: string;
      href: string;
      visible: boolean;
      order: number;
    }>;
  };
  about: {
    hero: {
      title: string;
      subtitle: string;
      description: string;
      backgroundImage?: string;
      stats: Array<{
        number: string;
        label: string;
      }>;
    };
    mission: {
      sectionTitle: string;
      cards: Array<{
        icon: string;
        title: string;
        description: string;
      }>;
    };
    programs: {
      sectionTitle: string;
      programList: Array<{
        logo: string;
        title: string;
        description: string;
        features: string[];
      }>;
    };
    impact: {
      sectionTitle: string;
      cards: Array<{
        icon: string;
        title: string;
        description: string;
      }>;
    };
    join: {
      title: string;
      description: string;
      primaryButton: string;
      secondaryButton: string;
    };
    sections?: Array<{
      id: string;
      title: string;
      content: string;
      type: string;
    }>;
  };
  contact: {
    hero: {
      title: string;
      subtitle: string;
      backgroundImage: string;
    };
    mainTitle: string;
    mainDescription: string;
    highlights: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
    stats: Array<{
      label: string;
      value: string;
    }>;
    contactMethods: {
      title: string;
      methods: Array<{
        icon: string;
        title: string;
        description: string;
        link?: string;
        linkType?: string;
        address?: string;
        socials?: string[];
      }>;
    };
    formSection: {
      title: string;
      description: string;
    };
    form: {
      title: string;
      subtitle: string;
      fields: Array<{
        name: string;
        label: string;
        type: string;
        required: boolean;
        placeholder: string;
      }>;
      submitText: string;
    };
    info: {
      address: string;
      email: string;
      meetingTimes: string;
    };
  };
  /** Competition team pages, keyed by team ("frc", "ftc", "vex"). */
  teams: Record<'frc' | 'ftc' | 'vex', TeamContent>;
  teamsOverviewTitle?: string;
  /** Hero text of the team members page. */
  team?: { hero: { title: string; subtitle: string } };
  teamsOverview: Array<{
    id: string;
    logo: string;
    name: string;
    description: string;
    founded: string;
    link: string;
    logoStyle?: ImageStyle;
    nameStyle?: TextStyle;
    descriptionStyle?: TextStyle;
  }>;
  teamMembers: Array<{
    id: string;
    name: string;
    role: string;
    grade: string;
    bio: string;
    skills: string[];
    team: string;
    image: string;
    imageStyle?: ImageStyle;
    nameStyle?: TextStyle;
    roleStyle?: TextStyle;
    bioStyle?: TextStyle;
  }>;
  sponsors: {
    /** Text over the page banner. */
    banner?: { title: string; subtitle: string };
    hero: {
      title: string;
      description: string;
      stats: Array<{
        value: string;
        label: string;
      }>;
    };
    currentSponsors: {
      title: string;
      intro: string;
      tiers: Array<{
        name: string;
        sponsors: Array<{
          name: string;
          logo: string;
          description: string;
        }>;
      }>;
    };
    howSponsorsHelp: {
      title: string;
      cards: Array<{
        icon: string;
        title: string;
        description: string;
      }>;
    };
    opportunities: {
      title: string;
      description: string;
      benefits: {
        title: string;
        items: string[];
      };
      tiers: {
        title: string;
        levels: Array<{
          amount: string;
          level: string;
        }>;
      };
      image: {
        src: string;
        alt: string;
        caption: {
          title: string;
          description: string;
        };
      };
    };
    contact: {
      title: string;
      description: string;
      details: Array<{
        label: string;
        value: string;
      }>;
    };
  };
  news: {
    hero: {
      title: string;
      subtitle: string;
      description: string;
      backgroundImage?: string;
    };
    articles: Array<{
      id: string;
      title: string;
      excerpt: string;
      content: string;
      author: string;
      publishDate: string;
      category: 'Competition' | 'Achievement' | 'Event' | 'Newsletter' | 'General';
      image?: string;
      imageStyle?: ImageStyle;
      tags: string[];
      link?: string;
      linkText?: string;
      /** Missing means published, so older content keeps working. */
      status?: 'draft' | 'published';
    }>;
  };
  footer: {
    quickLinksTitle?: string;
    socialTitle?: string;
    branding: {
      logo: string;
      logoAlt: string;
      organizationName: string;
      teamName: string;
      schoolName: string;
    };
    contact: {
      address: string;
      addressLine2?: string;
    };
    quickLinks: Array<{
      name: string;
      href: string;
    }>;
    social: Array<{
      platform: string;
      url: string;
      icon: string;
    }>;
    legal: {
      copyright: string;
      websiteDeveloper?: string;
      betaNotice?: string;
    };
  };
}

// The team pages store these sections in a shape that each page component
// defines for itself, so the content layer keeps them loose on purpose.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TeamSlot = any;

export interface TeamContent {
  hero: { title: string; subtitle: string };
  overview?: TeamSlot;
  gallery?: { title: string; robots?: TeamSlot[] };
  structure?: { title: string; subteams?: TeamSlot[] };
  schedule?: { title: string; events?: TeamSlot[] };
}
