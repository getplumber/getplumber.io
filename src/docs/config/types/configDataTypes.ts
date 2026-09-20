// site data types

export type Social = {
  social: string;
  link: string;
  icon: string;
};

export type DocsSiteData = {
  title: string;
  description: string;
  navSocials: Social[] | undefined;
  footerSocials: Social[] | undefined;
  defaultImage: {
    src: string;
    alt: string;
  };
  author: {
    name: string;
    email: string;
    twitter: string; // used for twitter cards when sharing a blog post on twitter
  };
};

// --------------------------------------------------------
// nav data types
export interface navLinkItem {
  text: string;
  link: string;
  newTab?: boolean; // adds target="_blank" rel="noopener noreferrer" to link
}

export type navItem = navLinkItem;

// --------------------------------------------------------
// site settings types
export interface DocsSiteSettingsProps {
  useViewTransitions?: boolean;
  copyLinkButtons?: boolean;
  pagination?: boolean;
  docsRoute?: string;
}

// --------------------------------------------------------
// documentation section types
/**
 * One sidebar section.
 *
 * Rendering rule (one rule, applied everywhere, see SidebarNav.astro):
 * - a section holding **several pages** renders its title as a non-link heading,
 *   with its pages as link entries below it;
 * - a section holding **exactly one page** renders as a single link entry carrying
 *   the section title, with the same page-link typography and active state as every
 *   other page link (never heading styling).
 *
 * So what is bold is never clickable, and what is clickable always looks like a page
 * link. Group headings (`group`) are unaffected: they stay non-link headings.
 */
export interface DocsSection {
  /**
   * Unique identifier for the section. This should match the folder name under src/data/docs/
   */
  id: string;
  /**
   * Display title for the section
   */
  title: string;
  /**
   * Fold this section by default: the heading becomes a disclosure control
   * (`details`/`summary`, keyboard operable, works without JavaScript) and its pages are
   * hidden until it is opened. A collapsed section opens automatically when the page being
   * viewed belongs to it. Only meaningful for a multi-page section: a single-page section
   * is one link and has nothing to fold.
   */
  collapsed?: boolean;
  /**
   * Optional parent group label. Consecutive sections sharing the same group render
   * nested under one bold group heading in the sidebar (e.g. "Platform").
   */
  group?: string;
  /**
   * Extra sidebar links for this section (same tab). Use for destinations outside this folder,
   * e.g. Platform docs linked from the Open Source CLI tab.
   */
  navLinks?: Array<{
    text: string;
    /** Path in the default locale, e.g. /docs/use-plumber/controls */
    href: string;
    indent?: boolean;
  }>;
}

/**
 * Configuration for a documentation tab
 */
export interface DocsTab {
  /**
   * Unique identifier for the tab
   */
  id: string;
  /**
   * Display title for the tab
   */
  title: string;
  /**
   * Description of the tab (optional)
   */
  description?: string;
  /**
   * Icon for the tab (optional)
   */
  icon?: string;
  /**
   * Ordered list of sidebar sections for this tab
   * The order determines the display order in navigation
   */
  sections: DocsSection[];
}

export interface DocsSidebarNavData {
  tabs: DocsTab[];
}

// --------------------------------------------------------
// testimonial data types
export interface TestimonialItem {
  avatar: ImageMetadata; // an imported image
  name: string;
  title: string;
  testimonial: string;
}
