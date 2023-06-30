// todo: after schema approval, move this to the sdk repo and import it here from there
export interface CommitLink {
  type: "commit";
  commit: string;
  report: typeof reports[keyof typeof reports];
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
  "contracts-v2",
] as const;

export type Repo = typeof repos[number];

export type Audits = Record<
  typeof repos[number],
  Array<CommitLink | BranchLink>
>;

export enum Auditor {
  ChainSecurity = "ChainSecurity",
  Consensys = "Consensys Diligence",
  SigmaPrime = "Sigma Prime",
}

export interface Report {
  auditor: Auditor;
  reportLink: string;
}

const reports = {
  "2022_Oct_Chainsec": {
    auditor: Auditor.ChainSecurity,
    reportLink:
      "https://github.com/Gearbox-protocol/security/blob/main/audits/2022%20Oct%20-%20ChainSecurity%20report.pdf",
  },
  "2022_Sep_Consensys": {
    auditor: Auditor.Consensys,
    reportLink:
      "https://github.com/Gearbox-protocol/security/blob/main/audits/2022%20Sep%20-%20Consensys%20Diligence.pdf",
  },
  "2023_Apr_ChainSec": {
    auditor: Auditor.ChainSecurity,
    reportLink:
      "https://github.com/Gearbox-protocol/security/blob/main/audits/2023%20Apr%20-%20Chainsecurity%20v2.1%20.pdf",
  },
  "2022_Aug_Sigma": {
    auditor: Auditor.SigmaPrime,
    reportLink:
      "https://github.com/Gearbox-protocol/security/blob/main/audits/2022%20Aug%20-%20SigmaPrime_Gearbox_Smart_Contract_Security_Assessment_Report_v2.pdf",
  },
};

export const audits: Audits = {
  "core-v2": [
    {
      type: "commit",
      commit: "c6ca919d46dcd82fa69c89316d9ff969e89bd3f6",
      report: reports["2022_Oct_Chainsec"],
    },
    {
      type: "commit",
      commit: "2f01dcaa2512a4f51157bacce45544c51e5033b3",
      report: reports["2023_Apr_ChainSec"],
    },
  ],
  "integrations-v2": [
    {
      type: "commit",
      commit: "c7290c3ef917f456653e7d5151dc610f338a0805",
      report: reports["2022_Sep_Consensys"],
    },
    {
      type: "commit",
      commit: "e0d628447c3916f70d34a033e5571b730c88574f",
      report: reports["2023_Apr_ChainSec"],
    },
  ],
  "integrations-v3": [
    {
      type: "commit",
      commit: "e34cfbe9fb7e3b41121acce1911c4484ca60e211",
      report: reports["2023_Apr_ChainSec"],
    },
  ],
  governance: [
    {
      type: "branch",
      branch: "master",
      comment: "Uniswap/governance fork",
    },
  ],
  "contracts-v2": [
    {
      type: "commit",
      commit: "0f500f03bf924715fb88844d942837a914b16b5b",
      report: reports["2022_Aug_Sigma"],
    },
  ],
};
