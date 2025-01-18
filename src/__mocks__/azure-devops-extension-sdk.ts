import { CommonServiceIds, IGlobalMessageBanner, IMessageDialogOptions, IProjectInfo } from "azure-devops-extension-api/Common";
import { BuildServiceIds, IBuildPageData } from "azure-devops-extension-api/Build";
import { IBuildConfiguration } from "../Config/Models";

const mockData = {
    buildPageData: <IBuildPageData><unknown>{
        build: {
            id: 2,
            sourceBranch: 'hotfix',
            sourceRepositoryName: 'FakeRepo',
        },
        definition: {
            id: 1,
        },
    },
    buildConfigurations: <IBuildConfiguration[]>[{
        buildDefinitionId: 1,
        gitPath: '/path/to/git',
        artifact: 'report_?.zip',
    }],
}

export let messages: {
    message?: string,
    okAction?: () => Promise<void>,
    cancelAction?: () => Promise<void>,
}[] = [];

export function init(): Promise<void> {
    return new Promise((resolve, reject) => resolve());
}

export function ready(): Promise<void> {
    return new Promise((resolve, reject) => resolve());
}

function openMessageDialog(message: string, options?: IMessageDialogOptions) {
    messages.push({
        message,
        okAction: async () => {
            const onClose = options?.onClose;
            if (onClose) {
                const asyncOnClose = onClose as (confirm: boolean) => Promise<void>;
                await asyncOnClose(true);
            }
        },
        cancelAction: async () =>{
            const onClose = options?.onClose;
            if (onClose) {
                const asyncOnClose = onClose as (confirm: boolean) => Promise<void>;
                await asyncOnClose(false);
            }
        }
    });
}

function addBanner(banner: IGlobalMessageBanner) {

    const { messageFormat, messageLinks } = banner;

    if (messageFormat && messageLinks) {

        // Replace {0} placeholders
        const message = messageFormat
            .replace(/\{(\d)\}/g, (_, c) =>
                messageLinks[parseInt(c)].href);

        messages.push({ message });

    } else {
        
        messages.push({ message: banner.message });
    }

}

async function getProject(): Promise<IProjectInfo | undefined> {
    return {
        id: 'projectx',
        name: 'ProjectX',
    } as IProjectInfo;
}

const getExtensionDataManager = jest.fn(dataManager => ({
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
                openMessageDialog,
            };

        case CommonServiceIds.GlobalMessagesService:
            return {
                addBanner,
                closeBanner: jest.fn(),
            };

        case CommonServiceIds.ProjectPageService:
            return {
                getProject,
            };

        case CommonServiceIds.ExtensionDataService:
            return {
                getExtensionDataManager,
            };
    
        case BuildServiceIds.BuildPageDataService:
            return {
                getBuildPageData: () => mockData.buildPageData,
            };
    }
}
