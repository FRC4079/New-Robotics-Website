// Style properties for images
export interface ImageStyle {
  width?: string;
  height?: string;
  borderRadius?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string; // e.g., 'center', 'top', 'bottom', 'left', 'right', '50% 50%'
}

// Style properties for text
export interface TextStyle {
  color?: string;
  fontSize?: string;
  fontFamily?: 'Titillium Web' | 'Montserrat' | 'Arial' | 'Helvetica' | 'sans-serif';
  fontWeight?: '300' | '400' | '500' | '600' | '700' | '900';
  lineHeight?: string;
  whiteSpace?: 'normal' | 'pre-line' | 'pre-wrap';
}

export interface SiteContent {
  site: {
    title: string;
    tagline: string;  
    description: string;
    keywords: string;
    logo: string;
    logoAlt: string;
    organizationName: string;
    organizationFullName?: string;
  };
  customPages?: {
    [key: string]: {
      title: string;
      subtitle?: string;
      content: string;
      sections?: Array<{
        title: string;
        content: string;
      }>;
    };
  };
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
  teams: {
    frc: {
      title: string;
      subtitle: string;
      description: string;
      backgroundImage: string;
      stats: Array<{
        id: string;
        label: string;
        value: string;
        description: string;
        icon: string;
      }>;
      achievements?: Array<{
        id: string;
        title: string;
        description: string;
        year: string;
        type: string;
        award: string;
        image?: string;
      }>;
      news?: Array<{
        id: string;
        title: string;
        excerpt: string;
        content: string;
        author: string;
        publishDate: string;
        category: string;
        image?: string;
        tags: string[];
      }>;
      teamOverview?: any;
      robots?: any[];
      teamStructure?: any;
      schedule?: any[];
    };
    ftc: {
      title: string;
      subtitle: string;
      description: string;
      backgroundImage: string;
      stats: Array<{
        id: string;
        label: string;
        value: string;
        description?: string;
        icon?: string;
      }>;
      achievements?: any[];
      news?: any[];
      teamOverview?: any;
      robots?: any[];
      teamStructure?: any;
      schedule?: any[];
    };
    vex: {
      title: string;
      subtitle: string;
      description: string;
      backgroundImage: string;
      stats: Array<{
        id: string;
        label: string;
        value: string;
        description?: string;
        icon?: string;
      }>;
      achievements?: any[];
      news?: any[];
      teamOverview?: any;
      robots?: any[];
      teamStructure?: any;
      schedule?: any[];
    };
  };
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
      category: 'Competition' | 'Achievement' | 'Event' | 'General';
      image?: string;
      imageStyle?: ImageStyle;
      tags: string[];
      link?: string;
      linkText?: string;
    }>;
  };
  footer: {
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
