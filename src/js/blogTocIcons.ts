import BrandGithub from "../icons/tabler/brand-github.svg";

/** Inline SVG components for blog sidebar TOC (avoids sprite refs that render empty in dev). */
export const blogTocIconComponents: Record<string, typeof BrandGithub> = {
  "tabler/brand-github": BrandGithub,
};

export function resolveBlogTocIcon(iconName: string | undefined) {
  if (!iconName) return undefined;
  return blogTocIconComponents[iconName];
}
