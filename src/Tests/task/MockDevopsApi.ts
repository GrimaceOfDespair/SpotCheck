import { IRequestHandler, IHttpClientResponse, IHttpClient, IRequestInfo, IRequestOptions } from 'azure-devops-node-api/interfaces/common/VsoBaseInterfaces';
import { JsonPatchDocument } from 'azure-devops-node-api/interfaces/common/VSSInterfaces';
import { IWebApiRequestSettings } from 'azure-devops-node-api/WebApi';
import { IGitApi } from 'azure-devops-node-api/GitApi';
import { GitPullRequestCommentThread, Comment } from 'azure-devops-node-api/interfaces/GitInterfaces';
import { RequestOptions } from 'node:http';

export class WebApi {
    constructor(defaultUrl: string, authHandler: IRequestHandler, options?: IRequestOptions, requestSettings?: IWebApiRequestSettings) {
    }

    async getGitApi(serverUrl?: string, handlers?: IRequestHandler[]): Promise<IGitApi>  {
        return <IGitApi>{
            getPullRequestProperties: async (repositoryId: string, pullRequestId: number, project?: string): Promise<any> => {
                return {};
            },
            updatePullRequestProperties: async (customHeaders: any, patchDocument: JsonPatchDocument, repositoryId: string, pullRequestId: number, project?: string): Promise<any> => {
                return {};
            },
            createThread: async (commentThread: GitPullRequestCommentThread, repositoryId: string, pullRequestId: number, project?: string): Promise<GitPullRequestCommentThread> => {
                return commentThread;
            },
            updateThread: async (commentThread: GitPullRequestCommentThread, repositoryId: string, pullRequestId: number, threadId: number, project?: string): Promise<GitPullRequestCommentThread> => {
                return commentThread;
            },
            createComment: async (comment: Comment, repositoryId: string, pullRequestId: number, threadId: number, project?: string): Promise<Comment> => {
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
