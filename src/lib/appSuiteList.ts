import {
  PUBLIC_JIOSTAR_CREATOR,
  PUBLIC_SCRIPT_STUDIO,
  PUBLIC_TALENTMATCH_AI,
  PUBLIC_TITAN_BASE_URL
} from "$env/static/public";

export type AppItem = {
  label: string;
  href: string;
  icon: string;
};

export type AppSuite = {
  suiteName: string;
  icon: string;
  bg?: string;
  apps: AppItem[];
};

export const suites: AppSuite[] = [
  {
    icon: "/static/suite/hr.svg",
    suiteName: "HR Suite",
    bg: "fff4ec",
    apps: [
      {
        label: "Policy Chatbot",
        href: `${PUBLIC_TITAN_BASE_URL}/?model=policy-chatbot`,
        icon: "/static/suite/policy-chatbot.svg",
      },
      {
        label: "Talent Match AI",
        href: PUBLIC_TALENTMATCH_AI,
        icon: "/static/talent-match-ai.png",
      },
    ]
  },
  {
    icon: "/static/suite/legal.svg",
    suiteName: "Legal Suite",
    bg: "edf1ff",
    apps: [
      {
        label: "Legal Contract Agent",
        href: `${PUBLIC_TITAN_BASE_URL}/?model=legal-contract-suit`,
        icon: "/static/suite/legal-contract-suit.svg",
      },
      {
        label: "Legal Knowledge Base",
        href: `${PUBLIC_TITAN_BASE_URL}/?model=legal-knowledge-base`,
        icon: "/static/suite/legal-knowledge-suit.svg",
      },
    ]
  },
  {
    icon: "/static/suite/business.svg",
    suiteName: "Business Suite",
    bg: "e6f8ff",
    apps: [
      {
        label: "TV Viewership Agent",
        href: `${PUBLIC_TITAN_BASE_URL}/?model=tv-viewership-2`,
        icon: "/static/suite/tv-viewership-2.svg",
      },
      {
        label: "TV Revenue Agent",
        href: `${PUBLIC_TITAN_BASE_URL}/?model=revenue-agent`,
        icon: "/static/suite/revenue-agent.svg",
      },
    ]
  },
  {
    icon: "/static/suite/content.svg",
    suiteName: "Content Suite",
    bg: "ffeeee",
    apps: [
      {
        label: "Script Studio",
        href: PUBLIC_SCRIPT_STUDIO,
        icon: "/static/script-studio.png",
      },
      {
        label: "Jiostar Creator",
        href: PUBLIC_JIOSTAR_CREATOR,
        icon: "/static/jioStar-creator.png",
      },
    ]
  },
];
