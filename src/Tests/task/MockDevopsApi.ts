import { IRequestHandler, IHttpClientResponse, IHttpClient, IRequestInfo, IRequestOptions } from 'azure-devops-node-api/interfaces/common/VsoBaseInterfaces';
import { JsonPatchDocument, JsonPatchOperation, Operation } from 'azure-devops-node-api/interfaces/common/VSSInterfaces';
import { IWebApiRequestSettings } from 'azure-devops-node-api/WebApi';
import { IGitApi } from 'azure-devops-node-api/GitApi';
import { GitPullRequestCommentThread, Comment, CommentThreadStatus } from 'azure-devops-node-api/interfaces/GitInterfaces';
import { RequestOptions } from 'node:http';

export let PullRequestStatus = {
    thread: <Comment[] | null>null,
    status: <CommentThreadStatus | undefined>undefined,
    properties: <any>{},
}

export function setPullRequest(comments?: Comment[]) {
    if (comments === undefined) {
        PullRequestStatus = {
            thread: null,
            status: CommentThreadStatus.Unknown,
            properties: {},
        }
    } else {
        PullRequestStatus = {
            thread: comments,
            status: CommentThreadStatus.Active,
            properties: { 'igorkalders.spotcheck.ThreadId': { '$value': '1' } },
        }
    }
}

export class WebApi {
    constructor(defaultUrl: string, authHandler: IRequestHandler, options?: IRequestOptions, requestSettings?: IWebApiRequestSettings) {
    }

    async getGitApi(serverUrl?: string, handlers?: IRequestHandler[]): Promise<IGitApi>  {
        return <IGitApi>{
            getPullRequestProperties: async (repositoryId: string, pullRequestId: number, project?: string): Promise<any> => {
                return { value: PullRequestStatus.properties };
            },
            updatePullRequestProperties: async (customHeaders: any, patchDocument: JsonPatchDocument, repositoryId: string, pullRequestId: number, project?: string): Promise<any> => {
                PullRequestStatus.properties = parsePatchDocument(patchDocument, PullRequestStatus.properties);
                return { value: PullRequestStatus.properties };
            },
            createThread: async (commentThread: GitPullRequestCommentThread, repositoryId: string, pullRequestId: number, project?: string): Promise<GitPullRequestCommentThread> => {
                const comments = commentThread.comments ?? [];
                PullRequestStatus.thread = [...comments];
                PullRequestStatus.status = commentThread.status;
                return commentThread;
            },
            updateThread: async (commentThread: GitPullRequestCommentThread, repositoryId: string, pullRequestId: number, threadId: number, project?: string): Promise<GitPullRequestCommentThread> => {
                PullRequestStatus.status = commentThread.status;
                return commentThread;
            },
            createComment: async (comment: Comment, repositoryId: string, pullRequestId: number, threadId: number, project?: string): Promise<Comment> => {
                if (PullRequestStatus.thread === undefined || PullRequestStatus.thread === null) {
                    throw Error("No thread available for comment");
                }
                PullRequestStatus.thread.push(comment);
                return comment;
            },
        };
    }
}

export function getPersonalAccessTokenHandler(token: string, allowCrossOriginAuthentication?: boolean): IRequestHandler {
    return {
        prepareRequest: (_: RequestOptions) => {},
        canHandleAuthentication: (_: IHttpClientResponse) => true,
        handleAuthentication: async (httpClient: IHttpClient, requestInfo: IRequestInfo, objs: any): Promise<IHttpClientResponse> => {
            return <IHttpClientResponse>{};
        }
    }
}

function parsePatchDocument(patch: JsonPatchDocument, input: any) {
    let output = input;

    const patchOperations = patch as JsonPatchOperation[];
    for (const patchOperation of patchOperations) {
        const property = patchOperation.path.replace('/', '');
        switch (patchOperation.op) {
            case Operation.Remove:
                delete output[property];
                break;
            case Operation.Add:
                output[property] = patchOperation.value;
                break;
        }
    }

    return output;
}