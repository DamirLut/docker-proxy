export type ConfigFile = {
  projects: Record<string, Project>;
  options: Options;
};

export type Options = {
  "watch-interval": number;
  "sish-host": string;
  "proxy-timeout": number;
};

export type Project = Record<string, boolean>;

export type Container = {
  Names: string[];
  Ports: { PublicPort: number }[];
  Labels: Record<string, any>;
};
