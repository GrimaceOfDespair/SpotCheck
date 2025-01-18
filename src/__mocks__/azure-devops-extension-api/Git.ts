import { IVssRestClientOptions } from "azure-devops-extension-api";
import { PagedList } from "azure-devops-extension-api/WebApi/WebApi";
import { GitPush, GitRef } from "azure-devops-extension-api/Git/Git";

export class GitRestClient {
    // tslint:disable-next-line: no-empty
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor(options: IVssRestClientOptions) {
    }

    getRefs = async function (repositoryId: string, project?: string, filter?: string, includeLinks?: boolean, includeStatuses?: boolean, includeMyBranches?: boolean, latestStatusesOnly?: boolean, peelTags?: boolean, filterContains?: string): Promise<PagedList<GitRef>> {

        return Object.assign([{
            name: 'hotfix',
        } as GitRef],
        { continuationToken: ''});
    }

    createPush = async function(push: GitPush, repositoryId: string, project?: string): Promise<GitPush> {
        return { ...push, pushId: 123 };
    }
}