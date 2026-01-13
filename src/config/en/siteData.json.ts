import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "Galaxy",
  // Your website's title and description (meta fields)
  title: "Galaxy - a slick startup / SaaS theme built using Astro and Tailwind CSS",
  description:
    "Get your new startup website up and running quickly with our beautiful website theme designed using Astro and Tailwind CSS. Perfect for freelancers, developers, startups, and personal use.",

  // Your information for blog post purposes
  author: {
    name: "Cosmic Themes",
    email: "creator@cosmicthemes.com",
    twitter: "Cosmic_Themes",
  },

  // default image for meta tags if the page doesn't have an image already
  defaultImage: {
    src: "/images/cosmic-themes-logo.jpg",
    alt: "Cosmic Themes logo",
  },
};

export default siteData;