import { CommonServiceIds, getClient, IHostPageLayoutService, IProjectPageService, MessageBannerLevel, IGlobalMessagesService } from "azure-devops-extension-api/Common";
import { IBuildPageDataService, BuildServiceIds, BuildReference, BuildRestClient } from "azure-devops-extension-api/Build";
import { GitRestClient, GitServiceIds } from "azure-devops-extension-api/Git";
import { GitChange, GitCommitRef, GitItem, GitPush, GitRefUpdate, ItemContentType, VersionControlChangeType } from "azure-devops-extension-api/Git/Git";
import { LocationsRestClient } from "azure-devops-extension-api/Locations/LocationsClient";
import * as SDK from "azure-devops-extension-sdk";
import { ITest } from "./Models";
import { showError } from "./Common";
import { getArtifactsFileEntries, getBuildConfiguration } from "./ArtifactBuildRestClient";
import { IBuildConfiguration } from "../Config/Models";

export const downloadArtifacts = async (artifactPattern: string, isBinary: boolean = false) => {
    const pps = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
    const project = await pps.getProject();
    const projectId = project?.id ?? '';
    const projectName = project?.name ?? '';

    const buildPageService: IBuildPageDataService = await SDK.getService(BuildServiceIds.BuildPageDataService);
    const buildPageData = await buildPageService.getBuildPageData();
    const buildId = buildPageData?.build?.id ?? 0;

    const buildClient = getClient(BuildRestClient);
    const fileEntries = await getArtifactsFileEntries(buildClient, projectName, buildId, artifactPattern, isBinary);

    return fileEntries;
}

export const downloadArtifact = async (artifactName: string, fileName: string, isBinary: boolean = false) => {

    const artifactContents = await downloadArtifacts(artifactName, isBinary);

    if (!artifactContents.length) {
        return {
            artifact: null,
            containerId: ''
        };
    }

    return  {
        artifact: artifactContents.find(content => content.name == fileName),
        containerId: artifactContents[0].containerId
    }
}

export const openUpdateDialog = async (test: ITest) => {

    const pps = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
    const project = await pps.getProject();

    if (!project) {
        showError('No current project found to update baseline on');
        return;
    }

    const buildConfiguration = await getBuildConfiguration();
    if (!buildConfiguration) {
        showError('SpotCheck not configured for this build');
        return;
    }

    const dialogService = await SDK.getService<IHostPageLayoutService>(CommonServiceIds.HostPageLayoutService);

    const buildPageService: IBuildPageDataService = await SDK.getService(BuildServiceIds.BuildPageDataService);
    const buildPageData = await buildPageService.getBuildPageData();

    if (!buildPageData) {
        showError('No build data found to update baseline on');
        return;
    }

    const build = buildPageData.build;
    if (!build) {
        showError('No build data found to update baseline on');
        return;
    }

    const { parameters, sourceBranch, sourceRepositoryId, sourceVersion } = buildPageData.build as any;

    const {
        'system.pullRequest.sourceBranch': prBranch,
        'system.pullRequest.sourceCommitId': prCommit
    } = JSON.parse(parameters ?? '{}');

    const branch = prBranch ?? sourceBranch;
    if (!branch) {
        showError('No git branch found to update baseline on');
        return;
    }

    const commit = prCommit ?? sourceVersion;

    const gitClient = getClient(GitRestClient);
    const branchFilter = branch.replace(/^refs\//, '');
    const refs = await gitClient.getRefs(sourceRepositoryId, project.id, branchFilter);

    if (!refs || !refs[0]) {
        showError(`Branch '${branchFilter}' was not found in the repository.`);
        return;
    }

    const latestCommitOnBranch = refs[0].objectId;
    const isLatestVersion = latestCommitOnBranch == commit;
    const message = isLatestVersion
        ? `Set this screenshot as the new baseline for ${test.name}?`
        : `New code was committed after this build, so the current screenshot may be inaccurate. Are you sure you want to set this screenshot as the new baseline for ${test.name}?`;
    const title = isLatestVersion ? 'Using screenshot as new baseline' : '⚠ Using screenshot as new baseline';

    dialogService.openMessageDialog(message, {
        showCancel: true,
        lightDismiss: true,
        title,
        okText: "Ok",
        cancelText: "Cancel",
        onClose: async (result) => {
            if (result) {
                await updateScreenshot(buildConfiguration, project.name, build, branch, latestCommitOnBranch, test);
            }
        }
    });
};


export const updateScreenshot = async(buildConfiguration: IBuildConfiguration, projectName: string, build: BuildReference, branch: string, commit: string, test: ITest) => {

    const { artifact: artifactName, gitPath: repositoryBasePath } = buildConfiguration;

    // Download screenshot from artifacts
    const { artifact } = await downloadArtifact(artifactName, test.comparison.artifactName, true);
    if (!artifact) {
        await showError(`Unable to download ${test.comparison.artifactName}`);
        return;
    }

    // Push new screenshot to repo
    const { sourceRepositoryId, sourceRepositoryName } = build as any;

    const content = await artifact.contentsPromise;
    const path = `${repositoryBasePath}/${test.baselinePath}`;

    const gitPush = {
        refUpdates: [{
            name: branch,
            oldObjectId: commit,
        } as GitRefUpdate],
        commits: [{
            comment: `Update baseline screenshot for test "${test.name}"`,
            changes: [
                {
                    changeType: VersionControlChangeType.Edit,
                    item: {
                        path
                    } as GitItem,
                    newContent: {
                        content,
                        contentType: ItemContentType.Base64Encoded
                    }
                } as GitChange
            ]
        } as GitCommitRef]
    } as GitPush;

    const gitClient = getClient(GitRestClient);

    try {
        const push = await gitClient.createPush(gitPush, sourceRepositoryId, projectName);

        const locationClient = getClient(LocationsRestClient);
        const resourceArea = await locationClient.getResourceArea('79134c72-4a58-4b42-976c-04e7115f32bf');
        const pushUrl = `${resourceArea.locationUrl}${projectName}/_git/${sourceRepositoryName}/pushes/${push.pushId}`;

        const globalMessagesSvc = await SDK.getService<IGlobalMessagesService>(CommonServiceIds.GlobalMessagesService);
        globalMessagesSvc.addBanner({
            level: MessageBannerLevel.info,
            customIcon: "ReceiptCheck",
            messageFormat: `Updated the new baseline image of "${test.name}. {0}"`,
            messageLinks: [{
                name: "View the git commit",
                href: pushUrl
            }]
        });
    } catch (error) {
        console.error(error);
        const globalMessagesSvc = await SDK.getService<IGlobalMessagesService>(CommonServiceIds.GlobalMessagesService);
        globalMessagesSvc.addBanner({
            level: MessageBannerLevel.error,
            customIcon: "ErrorBadge",
            message: `Unable to update baseline image of "${test.name}"`,
        });
    }

    // Show banner with push link
}
