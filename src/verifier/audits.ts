// todo: after schema approval, move this object to the sdk repo and import it here from there
export interface CommitLink {
  type: "commit";
  commit: string;
  report: Report;
}
export interface BranchLink {
  type: "branch";
  branch: string;
  comment?: string;
}

export const repos = [
  "core-v2",
  "integrations-v2",
  "integrations-v3",
  "governance",
] as const;

export type Repo = typeof repos[number];

export type Audits = Record<
  typeof repos[number],
  Array<CommitLink | BranchLink>
>;

export enum Auditor {
  ChainSecurity = "ChainSecurity",
  Consensys = "Consensys Diligence",
}

export interface Report {
  auditor: Auditor;
  reportLink: string;
}

const reports: Record<string, Report> = {
  "2022 Oct": {
    auditor: Auditor.ChainSecurity,
    reportLink:
      "https://github.com/Gearbox-protocol/security/blob/main/audits/2022%20Oct%20-%20ChainSecurity%20report.pdf",
  },
  "2022 Sep": {
    auditor: Auditor.Consensys,
    reportLink:
      "https://github.com/Gearbox-protocol/security/blob/main/audits/2022%20Sep%20-%20Consensys%20Diligence.pdf",
  },
  "2023 Apr": {
    auditor: Auditor.ChainSecurity,
    reportLink:
      "https://github.com/Gearbox-protocol/security/blob/main/audits/2023%20Apr%20-%20Chainsecurity%20v2.1%20.pdf",
  },
};

export const audits: Audits = {
  "core-v2": [
    {
      type: "commit",
      commit: "c6ca919d46dcd82fa69c89316d9ff969e89bd3f6",
      report: reports["2022 Oct"],
    },
    {
      type: "commit",
      commit: "2f01dcaa2512a4f51157bacce45544c51e5033b3",
      report: reports["2023 Apr"],
    },
  ],
  "integrations-v2": [
    {
      type: "commit",
      commit: "c7290c3ef917f456653e7d5151dc610f338a0805",
      report: reports["2022 Sep"],
    },
    {
      type: "commit",
      commit: "e0d628447c3916f70d34a033e5571b730c88574f",
      report: reports["2023 Apr"],
    },
  ],
  "integrations-v3": [
    {
      type: "commit",
      commit: "e34cfbe9fb7e3b41121acce1911c4484ca60e211",
      report: reports["2023 Apr"],
    },
  ],
  governance: [
    {
      type: "branch",
      branch: "master",
      comment: "Uniswap/governance fork",
    },
  ],
};
