import {
  PUBLIC_SHOWSENSE_AI,
  PUBLIC_TALENTMATCH_AI,
  PUBLIC_TITAN_BASE_URL
} from "$env/static/public";

// 1. Define the specific model constants
const policyChatbot = "policy-chatbot";
const legalContractSuit = "legal-contract-suit";
const legalKnowledgeBase = "legal-knowledge-base";
const tvViewership = "tv-viewership-2";
const revenueAgent = "revenue-agent";

// 2. Create a Union Type from these specific values
export type AppModel = 
  | typeof policyChatbot 
  | typeof legalContractSuit 
  | typeof legalKnowledgeBase 
  | typeof tvViewership 
  | typeof revenueAgent;

export type AppItem = {
  label: string;
  href: string;
  icon: string;
  model?: AppModel;
  access?: boolean;
};

export type AppSuite = {
  suiteName: string;
  icon: string;
  bg?: string;
  apps: AppItem[]
};

export const suites: AppSuite[] = [
  {
    icon: "/static/suite/hr.svg",
    suiteName: "HR Suite",
    bg: "fff4ec",
    apps: [
      {
        label: "Policy Chatbot",
        href: `${PUBLIC_TITAN_BASE_URL}/?model=${policyChatbot}`,
        icon: "/static/suite/policy-chatbot.svg",
        model: policyChatbot,
        access: false
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
        href: `${PUBLIC_TITAN_BASE_URL}/?model=${legalContractSuit}`,
        icon: "/static/suite/legal-contract-suit.svg",
        model: legalContractSuit,
        access: false
      },
      {
        label: "Legal Knowledge Base",
        href: `${PUBLIC_TITAN_BASE_URL}/?model=${legalKnowledgeBase}`,
        icon: "/static/suite/legal-knowledge-suit.svg",
        model: legalKnowledgeBase,
        access: false
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
        href: `${PUBLIC_TITAN_BASE_URL}/?model=${tvViewership}`,
        icon: "/static/suite/tv-viewership-2.svg",
        model: tvViewership,
        access: false
      },
      {
        label: "TV Revenue Agent",
        href: `${PUBLIC_TITAN_BASE_URL}/?model=${revenueAgent}`,
        icon: "/static/suite/revenue-agent.svg",
        model: revenueAgent,
        access: false
      },
    ]
  },
  {
    icon: "/static/suite/marketing.svg",
    suiteName: "Marketing Suite",
    bg: "f5eeff",
    apps: [
      {
        label: "ShowSense.AI",
        href: PUBLIC_SHOWSENSE_AI,
        icon: "/static/showSense_ai.svg",
      },
    ]
  },
];