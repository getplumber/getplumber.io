// site data types
export interface SiteDataProps {
  name: string;
  title: string;
  description: string;
  /** Homepage (`/`) meta; falls back to `title` / `description` when omitted */
  homepageTitle?: string;
  homepageDescription?: string;
  author: {
    // used for blog post purposes
    name: string;
    email: string;
    twitter: string; // used for twitter cards when sharing a blog post on twitter
  };
  defaultImage: {
    src: string;
    alt: string;
  };
}

// --------------------------------------------------------
// nav data types
export interface navLinkItem {
  text: string;
  link: string;
  newTab?: boolean; // adds target="_blank" rel="noopener noreferrer" to link
  icon?: string; // adds an icon to the left of the text
  hidden?: boolean; // kept in the data but not rendered yet (page does not exist)
}

export interface navDropdownItem {
  text: string;
  dropdown: navLinkItem[];
}

export interface navMegaDropdownColumn {
  title: string;
  items: navLinkItem[];
}

export interface navMegaDropdownItem {
  text: string;
  megaMenuColumns: navMegaDropdownColumn[];
}

export type navItem = navLinkItem | navDropdownItem | navMegaDropdownItem;

// call-to-action buttons rendered at the end of the navbar
export interface navCta {
  text: string;
  link: string;
  variant: "primary" | "secondary";
  newTab?: boolean;
}

// --------------------------------------------------------
// faq data types
export interface FaqItem {
  question: string; // this is the question of the accordion
  answer: string; // these are the details seen after expanding the accordion
}

// --------------------------------------------------------
// testimonial data types
export interface TestimonialItem {
  avatar: ImageMetadata; // an imported image
  name: string;
  title: string;
  testimonial: string;
}

// --------------------------------------------------------
// team data types
export interface teamMember {
  image: ImageMetadata; // an imported image
  name: string;
  title: string;
  bio: string;
}

// --------------------------------------------------------
// site settings types
export interface SiteSettingsProps {
  useViewTransitions?: boolean;
  useAnimations?: boolean;
}

// --------------------------------------------------------
// footer data types
export interface FooterColumn {
  title: string;
  links: { text: string; link: string; newTab?: boolean }[];
}

export interface SocialLink {
  text: string;
  link: string;
  icon: string; // icon name in src/icons, e.g. "tabler/brand-github"
}

// --------------------------------------------------------
// home page data types (src/config/en/homeData.json.ts)
export interface Cta {
  text: string;
  link: string;
  variant: "primary" | "secondary" | "secondary-trailing" | "ghost";
  newTab?: boolean;
}

export interface Stat {
  value: string;
  label: string;
  source?: string;
  sourceLink?: string;
}

export interface Step {
  number: string;
  title: string;
  text: string;
}

export interface Incident {
  date: string;
  figure: string;
  text: string;
  source: string;
  sourceLink?: string;
  highlight?: boolean;
}

export interface YamlLine {
  n: number;
  key: string; // dimmed part of the line, e.g. "    runs-on: "
  value?: string; // highlighted part, e.g. "ubuntu-latest"
  flag?: number; // issue number when the line is flagged
}

export interface Callout {
  title: string;
  text: string;
}

export interface ProductColumn {
  number: string;
  title: string;
  text: string;
  quote?: string;
  ctas: Cta[];
}
