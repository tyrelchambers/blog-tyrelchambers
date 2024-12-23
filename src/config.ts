import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://blog.tyrelchambers.com/", // replace this with your deployed domain
  author: "Tyrel Chambers",
  profile: "https://tyrelchambers.com/",
  desc: "A place for musings.",
  title: "Code & Context",
  ogImage: "",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 3,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  editPost: {
    url: "https://github.com/tyrelchambers/blog-tyrelchambers/tree/master/src/content/blog",
    text: "Suggest Changes",
    appendFilePath: true,
  },
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/tyrelchambers",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "Instagram",
    href: "https://instagram.com/imtyrelchambers",
    linkTitle: `${SITE.title} on Instagram`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/tyrel-chambers-8ab581214/",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "X",
    href: "https://x.com/imtyrelchambers",
    linkTitle: `${SITE.title} on X`,
    active: true,
  },
];
