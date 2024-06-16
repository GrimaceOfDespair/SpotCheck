import { CommonServiceIds } from "azure-devops-extension-api";
import { BuildRestClient, BuildServiceIds } from "azure-devops-extension-api/Build";
import { GitRestClient } from "azure-devops-extension-api/Git";
import { LocationsRestClient } from "azure-devops-extension-api/Locations/LocationsClient";

export function init(): Promise<void> {
    return new Promise((resolve, reject) => resolve());
}

export const mockOpenMessageDialog = jest.fn();
export const mockCloseBanner = jest.fn();
export const mockGetProject = jest.fn();
export const mockGetBuildPageData = jest.fn();

export function getService(contributionId: string) {
    switch (contributionId) {
        case CommonServiceIds.HostPageLayoutService:
            return {
                openMessageDialog: mockOpenMessageDialog,
            };

        case CommonServiceIds.GlobalMessagesService:
            return {
                closeBanner: mockCloseBanner,
            };

        case CommonServiceIds.ProjectPageService:
            return {
                getProject: mockGetProject,
            };

        case BuildServiceIds.BuildPageDataService:
            return {
                getBuildPageData: mockGetBuildPageData,
            };
    }
}
