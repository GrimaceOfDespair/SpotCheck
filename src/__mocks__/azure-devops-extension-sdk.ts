import { CommonServiceIds } from "azure-devops-extension-api/Common";
import { BuildServiceIds } from "azure-devops-extension-api/Build";


export function init(): Promise<void> {
    return new Promise((resolve, reject) => resolve());
}

export function ready(): Promise<void> {
    return new Promise((resolve, reject) => resolve());
}

export const mockOpenMessageDialog = jest.fn();
export const mockCloseBanner = jest.fn();
export const mockGetProject = jest.fn();
export const mockGetBuildPageData = jest.fn();
export const mockGetExtensionDataManager = jest.fn(dataManager => ({
    getValue() {
        return [];
    }
}));

export function getExtensionContext() {
    return 'mocked_extension_context';
}

export function getAccessToken() {
    return 'mocked_access_token';
}

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

        case CommonServiceIds.ExtensionDataService:
            return {
                getExtensionDataManager: mockGetExtensionDataManager,
            };
    
        case BuildServiceIds.BuildPageDataService:
            return {
                getBuildPageData: mockGetBuildPageData,
            };
    }
}
