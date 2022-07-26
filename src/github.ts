import * as core from '@actions/core';
import * as github from '@actions/github';

export interface IRepo {
  owner: string;
  repo: string;
}

export class GithubApi {
  private octokit;
  private repo: IRepo;
  private issueNumber: number | undefined;

  constructor(token: string) {
    this.octokit = github.getOctokit(token);
    this.repo = github.context.repo;

    if (github.context.payload.issue) {
      this.issueNumber = github.context.payload.issue.number;
    } else if (github.context.payload.pull_request) {
      this.issueNumber = github.context.payload.pull_request.number;
    } else {
      core.setFailed('Error retrieving issue number');
    }

  }

  public async setPullRequestLabels(labels: string[]) {
    if (!labels.length) return;
    if (this.issueNumber !== undefined) {
      await this.octokit.rest.issues.addLabels({
        owner: this.repo.owner,
        repo: this.repo.repo,
        issue_number: this.issueNumber,
        labels,
      });
    }
  }


  public async getIssueNumber() {
    return this.issueNumber;
  }

  public async getPullsData(page: number=1) {
    // head props can be used below to filter PRs based on title(no big change type)
    const response = await this.octokit.rest.pulls.list({
      owner: this.repo.owner,
      repo: this.repo.repo,
      state: 'all',
      per_page: 100,
      page: page,
    });
    return response.data;
  }

  public async paginateData(): Promise<number | undefined> { // issueCreator: string) {
    let numPRs = undefined;
    const issueCreator = await this.getIssueCreator().catch(error => {
      core.setFailed(error.message);
    });
    if (issueCreator !== undefined) {
      await this.octokit.paginate(this.octokit.rest.issues.listForRepo, {
        owner: this.repo.owner,
        repo: this.repo.repo,
        state: 'all',
        //q: `is:pr author:${issueCreator}`,
        creator: issueCreator,
      }).then((issues) => {
        issues = issues.filter(isPull => isPull.pull_request); // unlimited opportunity to filter more here
        //console.log(issues);
        console.log(`${issueCreator} has made ${issues.length} PRs`);
        numPRs = issues.length;
      });
    }
    return numPRs;
  }

  public async getIssueCreator() {
    if (this.issueNumber !== undefined) {
      const { data } = await this.octokit.rest.issues.get({
        owner: this.repo.owner,
        repo: this.repo.repo,
        issue_number: this.issueNumber,
      });
      return data.user?.login;
    } else {return undefined;}
  }

  public async writePRComments(comment: string) {
    if (this.issueNumber !== undefined) {
      await this.octokit.rest.issues.createComment({
        owner: this.repo.owner,
        repo: this.repo.repo,
        issue_number: this.issueNumber,
        body: comment,
      });
    }
  }

}
