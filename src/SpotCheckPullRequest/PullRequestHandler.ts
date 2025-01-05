import * as azdev from 'azure-devops-node-api';
import { IDiffTest, IDiffTestReport } from './Report/DiffReport';
import { CommentThreadStatus, CommentType } from 'azure-devops-node-api/interfaces/GitInterfaces';
import { IssueAuditAction, IssueSource } from 'azure-pipelines-task-lib/internal';

function throwExpression(errorMessage: string): never {
    throw new Error(errorMessage);
}

export interface ITaskLib {
    getVariable(name: string): string | undefined;
    warning(message: string, source?: IssueSource, auditAction?: IssueAuditAction): void;
    error(message: string, source?: IssueSource, auditAction?: IssueAuditAction): void;
    debug(message: string): void;
}

export class PullRequestHandler {
    private _taskLib: ITaskLib;
    private _collectionUrl: string;
    private _connection: azdev.WebApi;
    private _projectName: string;
    private _repositoryId: string;
    private _buildId: number;
    private _pullRequestId: number;
    private _extensionIdentifier: string = 'igorkalders.spotcheck';
    private _buildUrl: string;

    constructor(taskLib: ITaskLib) {

        this._taskLib = taskLib;

        const [ token, collectionUrl, projectName, repositoryId, buildId, pullRequestId ] = [
            [ 'System.AccessToken', 'No access token available' ],
            [ 'System.TeamFoundationCollectionUri', 'TFS Collection Url not found' ],
            [ 'System.TeamProject', 'PR handler should run within the context of a TFS project' ],
            [ 'Build.Repository.ID', 'No repository found to relate PR to' ],
            [ 'Build.BuildId', 'PR handler should run within the context of a TFS build' ],
            [ 'System.PullRequest.PullRequestId', '' ],
        ]
        .map(([key, err]) =>
            this._taskLib.getVariable(key) ?? (err == '' ? '' : throwExpression(err)));

        this._collectionUrl = collectionUrl;
        this._projectName = projectName;
        this._repositoryId = repositoryId;
        this._buildId = parseInt(buildId);
        this._pullRequestId = parseInt(pullRequestId);

        const authHandler = azdev.getPersonalAccessTokenHandler(token);
        this._connection = new azdev.WebApi(collectionUrl, authHandler);

        this._buildUrl = `${this._collectionUrl}${this._projectName}/_build/results?buildId=${this._buildId}&view=IgorKalders.spotcheck.spotcheck-build`;
    }

    async processFeedback(report: IDiffTestReport) {

        const allTests = report.suites.flatMap(suite => suite.tests);
        const failedTests = allTests.filter(test => test.status == 'fail');
        const noFailures = failedTests.length == 0;

        if (!noFailures) {
            this._taskLib.warning(`${failedTests.length} screenshot(s) not matching baseline (${this._buildUrl})`);
        }

        if (isNaN(this._pullRequestId)) {
            this._taskLib.warning(`No pull request found to update`);
            return noFailures;
        }

        this._taskLib.debug(`Updating pull request ${this._pullRequestId}`);

        const threadId = await this.getThreadId();

        if (noFailures) {

            this._taskLib.debug(`E2E report contains no failures`);

            if (threadId !== undefined) {
                
                // If no previous failure was registered, there is nothing to update
                await this.closeThread(threadId, allTests);
            }

        } else {

            this._taskLib.warning(`E2E report contains failures`);

            if (threadId === undefined) {

                await this.createThread(failedTests);

            } else {

                await this.updateThread(threadId, failedTests);
            }
        }

        return noFailures;
    }

    private async updateThread(threadId: number, failedTests: IDiffTest[]) {
        
        this._taskLib.debug(`Adding comment to pull request ${this._pullRequestId}, thread ${threadId}`);

        const gitApi = await this._connection.getGitApi(this._collectionUrl);

        await gitApi.createComment(
            {
                parentCommentId: 0,
                content: this.createMessage(failedTests),
                commentType: CommentType.Text
            },
            this._repositoryId,
            this._pullRequestId,
            threadId,
            this._projectName);

        await gitApi.updateThread(
            {
                status: CommentThreadStatus.Active
            },
            this._repositoryId,
            this._pullRequestId,
            threadId,
            this._projectName);
    }

    private async createThread(failedTests: IDiffTest[]) {

        this._taskLib.debug(`Creating new thread on pull request ${this._pullRequestId}`);

        const gitApi = await this._connection.getGitApi(this._collectionUrl);

        const { id: newThreadId } = await gitApi.createThread(
            {
                status: CommentThreadStatus.Active,
                comments: [{
                    parentCommentId: 0,
                    content: this.createMessage(failedTests),
                    commentType: CommentType.Text
                }]
            },
            this._repositoryId,
            this._pullRequestId,
            this._projectName);

        await gitApi.updatePullRequestProperties(
            null,
            [{
                op: 'add',
                path: `/${this._extensionIdentifier}.ThreadId`,
                value: newThreadId,
            }],
            this._repositoryId,
            this._pullRequestId,
            this._projectName);
    }

    private async closeThread(threadId: number, allTests: IDiffTest[]) {
        
        this._taskLib.debug(`Close pending comments on thread ${threadId}`);

        const gitApi = await this._connection.getGitApi(this._collectionUrl);

        await gitApi.createComment({
            content: `[All ${allTests.length} E2E screenshots](${this._buildUrl}) are now within expected thresholds.`
        },
            this._repositoryId,
            this._pullRequestId,
            threadId,
            this._projectName);

        await gitApi.updateThread({
            status: CommentThreadStatus.Fixed
        },
            this._repositoryId,
            this._pullRequestId,
            threadId,
            this._projectName);

        await gitApi.updatePullRequestProperties(
            null,
            [{
                op: 'remove',
                path: `/${this._extensionIdentifier}.ThreadId`,
            }],
            this._repositoryId,
            this._pullRequestId,
            this._projectName);
    }

    private async getThreadId(): Promise<number | undefined> {
        
        const gitApi = await this._connection.getGitApi(this._collectionUrl);
        const properties = await gitApi.getPullRequestProperties(this._repositoryId, this._pullRequestId, this._projectName);
        const propertiesValue = properties.value;

        if (propertiesValue === undefined) {
            return undefined;
        }

        return parseInt(propertiesValue[`${this._extensionIdentifier}.ThreadId`]?.$value);
    }

    private createMessage(failedTests: IDiffTest[]) {

        const sortedTests = [...failedTests].sort((t1, t2) =>
            t2.percentage - t1.percentage);

        const failedScreenshots = sortedTests.length > 1
            ? `${sortedTests.length} screenshots`
            : '1 screenshot';

        const actualPercentage = (100 * sortedTests[0].percentage).toFixed(0);
        const actualChange = sortedTests.length > 1
            ? `The biggest change was around ${actualPercentage}%`
            : `The change was around ${actualPercentage}%`;

        const expectedPercentage = 100 * sortedTests[0].failureThreshold;

        return `[${failedScreenshots} on the E2E tests](${this._buildUrl}) changed more than anticipated. ${actualChange}, where max ${expectedPercentage}% was expected`;
    }
}