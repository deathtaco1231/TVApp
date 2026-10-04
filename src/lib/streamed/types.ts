export interface Sport {
  id: string;
  name: string;
}

export interface TeamInfo {
  name: string;
  badge: string;
}

export interface MatchTeams {
  home?: TeamInfo;
  away?: TeamInfo;
}

export interface MatchSource {
  source: string;
  id: string;
}

export interface APIMatch {
  id: string;
  title: string;
  category: string;
  date: number;
  poster?: string;
  popular: boolean;
  teams?: MatchTeams;
  sources: MatchSource[];
}

export interface Stream {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  embedUrl: string;
  source: string;
  viewers?: number;
}
