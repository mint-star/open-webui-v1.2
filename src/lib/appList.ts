import { PUBLIC_TITAN_BASE_URL } from "$env/static/public";

// 1. Define only the specific model constants you need
const tvViewership = "tv-viewership-2";
const revenueAgent = "revenue-agent";
const policyChatbot = "policy-chatbot";

// 2. Create a Union Type from these specific values
export type AppModel = 
  | typeof policyChatbot 
  | typeof tvViewership 
  | typeof revenueAgent;

export type AppItem = {
  label: string;
  href: string;
  icon: string;
  model?: AppModel;
  access?: boolean;
  tag?: string;
};

// 3. Flattened array containing only the three requested apps
export const apps: AppItem[] = [
  {
    label: "TV Viewership Agent",
    href: `${PUBLIC_TITAN_BASE_URL}/?model=${tvViewership}`,
    icon: "/static/suite/tv-viewership-2.svg",
    model: tvViewership,
    access: false,
  },
  {
    label: "TV Revenue Agent",
    href: `${PUBLIC_TITAN_BASE_URL}/?model=${revenueAgent}`,
    icon: "/static/suite/revenue-agent.svg",
    model: revenueAgent,
    access: false,
  },
  // {
  //   label: "Policy Chatbot",
  //   href: `${PUBLIC_TITAN_BASE_URL}/?model=${policyChatbot}`,
  //   icon: "/static/suite/policy-chatbot.svg",
  //   model: policyChatbot,
  //   access: false,
  // }
];