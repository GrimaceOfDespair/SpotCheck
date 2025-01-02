import { CommonServiceIds } from "azure-devops-extension-api/Common";
import { BuildServiceIds, IBuildPageData } from "azure-devops-extension-api/Build";
import { IBuildConfiguration } from "../Config/Models";

const mockData = {
    buildPageData: <IBuildPageData>{
        build: {
            id: 2,
        },
        definition: {
            id: 1,
        }
    },
    buildConfigurations: <IBuildConfiguration[]>[{
        buildDefinitionId: 1,
        gitPath: '/path/to/git',
        artifact: 'report_?.zip',
    }]
}

export function init(): Promise<void> {
    return new Promise((resolve, reject) => resolve());
}

export function ready(): Promise<void> {
    return new Promise((resolve, reject) => resolve());
}

export const mockOpenMessageDialog = jest.fn();
export const mockCloseBanner = jest.fn();
export const mockGetProject = jest.fn();

export const mockGetExtensionDataManager = jest.fn(dataManager => ({
    getValue(id: string) {
        switch (id) {
            case 'buildConfigurations':
                return mockData.buildConfigurations;

            default:
                return {};
        }
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
                getBuildPageData: () => mockData.buildPageData,
            };
    }
}
