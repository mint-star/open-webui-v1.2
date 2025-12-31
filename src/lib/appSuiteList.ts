import {
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
  apps: AppItem[];
};

export const suites: AppSuite[] = [
  {
    suiteName: "HR Suite",
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
    suiteName: "Legal Suite",
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
    suiteName: "Content Suite",
    apps: [
      {
        label: "General Chat",
        href: `${PUBLIC_TITAN_BASE_URL}/?model=general-chat`,
        icon: "/static/suite/general-chat.svg",
      },
      {
        label: "Azure OpenAI GPT-5",
        href: `${PUBLIC_TITAN_BASE_URL}/?model=azure-openai-gpt-5`,
        icon: "/static/suite/azure-openAI.svg",
      },
      {
        label: "TV Viewership-2",
        href: `${PUBLIC_TITAN_BASE_URL}/?model=tv-viewership-2`,
        icon: "/static/suite/tv-viewership-2.svg",
      },
      {
        label: "Revenue Agent",
        href: `${PUBLIC_TITAN_BASE_URL}/?model=revenue-agent`,
        icon: "/static/suite/revenue-agent.svg",
      },
      {
        label: "Script Studio",
        href: PUBLIC_SCRIPT_STUDIO,
        icon: "/static/script-studio.png",
      },
    ]
  },
];
