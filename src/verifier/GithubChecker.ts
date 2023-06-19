/*
 * Copyright (c) 2021. Gearbox
 */
import axios from "axios";

import { LoggedDeployer } from "../logger/loggedDeployer";
import { audits, BranchLink, CommitLink, Repo } from "./audits";

export interface VerifyRequest {
  address: string;
  constructorArguments: Array<any>;
}

export interface EtherscanSource {
  sources: Record<
    string,
    {
      content: string;
    }
  >;
}

export interface ReportVerificationResult {
  audit?: CommitLink | BranchLink;
  identical: boolean;
  githubUrl: string;
}

export interface ContractCheckResult {
  contract: string;
  reportsVerificationResult: Array<ReportVerificationResult>;
}

export interface FullContractAndImportsResult {
  contractName: string;
  sources: Array<ContractCheckResult>;
}

export class GithubChecker extends LoggedDeployer {
  protected readonly _audits = audits;

  public constructor(
    protected readonly _apiKey: string,
    protected readonly _networkName: "mainnet" | "goerli",
  ) {
    super();

    if (this._apiKey === "") {
      throw new Error("No etherscan API provided");
    }
  }

  public async compareWithGithub(
    address: string,
  ): Promise<FullContractAndImportsResult> {
    this.enableLogs();
    this._logger.debug(`Checking contracts from ${address}`);
    const url = `${this._baseUrl(
      this._networkName,
    )}/api?module=contract&action=getsourcecode&address=${address}&apikey=${
      this._apiKey
    }`;
    const source = await axios.get(url);
    if (!source.data.result || source.data.status !== "1") {
      console.error(source);
      throw new Error("Cant get source from etherscan");
    }

    const mainContractName = source.data.result[0].ContractName;

    const fullContractSourcesCheckResult: FullContractAndImportsResult = {
      contractName: mainContractName,
      sources: [],
    };

    const etherscanResponse = (source.data.result as Array<any>).map(
      c => c.SourceCode,
    );

    const etherscanData: EtherscanSource = JSON.parse(
      etherscanResponse[0].substr(1, etherscanResponse[0].length - 2),
    );

    for (let [entry, data] of Object.entries(etherscanData.sources)) {
      console.log("checking entry", entry);
      if (!entry.startsWith("@gearbox-protocol")) continue;

      const contract = entry.split("/").pop();

      if (contract === undefined) {
        throw new Error(`Can't get contract name from ${entry}`);
      }

      const contractNameWithSol = entry.split("/").pop();
      if (!contractNameWithSol) {
        continue;
      }

      const contractName = contractNameWithSol.replace(".sol", "");

      if (contractName !== mainContractName) continue;

      const repoName = entry.split("/")[1];

      const contractCheckResult: ContractCheckResult = {
        contract,
        reportsVerificationResult: [],
      };

      if (!(repoName in this._audits)) {
        continue;
      }

      const repo = repoName as Repo;
      const audits = this._audits[repo];

      for (const audit of audits) {
        console.log("checking audit", audit, "for entry", entry);

        let replacementPath: string;

        if (audit.type === "commit") {
          replacementPath = `${repo}/${audit.commit}`;
        } else {
          replacementPath = `${repo}/${audit.branch}`;
        }

        const githubRawUrl = entry
          .replace(
            "@gearbox-protocol",
            "https://raw.githubusercontent.com/Gearbox-protocol",
          )
          .replace(repo, replacementPath);

        let githubSource: string;

        try {
          githubSource = await this.getGithubSource(githubRawUrl);
        } catch (e) {
          this._logger.error(`get github source error: ${e}`);
          continue;
        }

        let identical = false;

        if (data.content.trim() !== githubSource.trim()) {
          this._logger.error(`Contract ${entry} is not identical!`);
          this._logger.info(`Etherscan version:\n${data.content}`);
          this._logger.info(`Github version:\n${githubSource}`);
        } else {
          identical = true;
          this._logger.debug(`Contract ${entry} is identical with main branch`);
        }

        let result: ReportVerificationResult;

        const githubUrl = githubRawUrl
          .replace("https://raw.githubusercontent.com", "https://github.com")
          .replace(repo, repo + "/blob");

        console.log("githubUrl", githubUrl);

        if (identical) {
          result = {
            identical: true,
            audit,
            githubUrl,
          };
        } else {
          result = {
            identical: false,
            githubUrl: githubRawUrl,
          };
        }

        console.log("result", result);

        contractCheckResult.reportsVerificationResult.push(result);
      }

      fullContractSourcesCheckResult.sources.push(contractCheckResult);
    }

    console.log("end", JSON.stringify(fullContractSourcesCheckResult, null, 2));

    return fullContractSourcesCheckResult;
  }

  protected async getGithubSource(url: string): Promise<string> {
    try {
      const githubSource = await axios.get(url);
      return githubSource.data;
    } catch (e) {
      throw new Error(`can't get github file, ${e}`);
    }
  }

  // https://raw.githubusercontent.com/Gearbox-protocol/core-v2/2f01dcaa2512a4f51157bacce45544c51e5033b3/contracts/core/access/Claimable.sol

  protected _baseUrl(networkName: string): String {
    switch (networkName) {
      case "mainnet":
        return "https://api.etherscan.io";
      case "goerli":
        return "https://api-goerli.etherscan.io";
      default:
        throw new Error(`${networkName} is not supported`);
    }
  }
}
