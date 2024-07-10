import { BuildRestClient, BuildServiceIds, IBuildPageDataService } from 'azure-devops-extension-api/Build'
import { RestClientBase } from 'azure-devops-extension-api/Common/RestClientBase';
import { IVssRestClientOptions } from 'azure-devops-extension-api/Common/Context';
import { getAccessToken } from 'azure-devops-extension-sdk';
import * as JSZip from 'jszip';
import * as SDK from "azure-devops-extension-sdk";

import { FileEntry, IArtifactData } from './ArtifactModels';
import { CommonServiceIds, IExtensionDataService } from 'azure-devops-extension-api';
import { IBuildConfiguration } from '../Config/Models';

export type ArtifactBuildRestClient = Pick<BuildRestClient, 'getArtifacts'>

async function getArtifactContentZip(downloadUrl: string): Promise<ArrayBuffer> {
    const accessToken = await getAccessToken();    
    const acceptType = "application/zip";
    const acceptHeaderValue = `${acceptType};excludeUrls=true;enumsAsNumbers=true;msDateFormat=true;noArrayWrap=true`;
    
    const headers = new Headers();
    headers.append("Accept", acceptHeaderValue);
    headers.append("Authorization", "Bearer " + accessToken);
    headers.append("Content-Type", "application/zip");
    headers.append("X-VSS-ReauthenticationAction", "Suppress");

    const options: RequestInit = {
        method: "GET",
        mode: "cors",
        credentials: "same-origin",
        headers: headers
    };
    const response = await fetch(downloadUrl, options);

    if (response.status === 302) {
        const redirectUrl = response.headers.get('location') as string;
        return await getArtifactContentZip(redirectUrl);
    } else if (response.status === undefined || response.status < 200 || response.status >= 300) {
        return new ArrayBuffer(0);
    }

    return response.arrayBuffer();
}

export async function getArtifactsFileEntries(
	buildClient: ArtifactBuildRestClient,
	project: string,
	buildId: number,
    artifactName: string,
    isBinary: boolean = false
	): Promise<FileEntry[]> {

	const artifacts = await buildClient.getArtifacts(project, buildId)
    
	const files = await Promise.all(
		artifacts
			.filter(artifact => 
                artifact.name === artifactName
			)
			.map(async artifact => {
				const requestUrl = artifact.resource.downloadUrl;
				const arrayBuffer = await getArtifactContentZip(requestUrl)

				if (arrayBuffer) {
					const zip = await JSZip.loadAsync(arrayBuffer)

					try {
						return Object
							.values(zip.files)
							.filter(entry => !entry.dir)
							.map(entry => ({
                                uri:             artifact.resource.url,
								name:            entry.name.replace(`${artifact.name}/`, ''),
								artifactName:    artifact.name,
                                containerId:     artifact.resource.data.split('/')[1],
								filePath:        entry.name.replace(`${artifact.name}/`, ''),
								buildId:         buildId,
								contentsPromise: entry.async(isBinary ? 'base64' : 'binarystring')
							}))
					} catch (e) {
						console.error(`Error loading artifact ${artifact.name} from build ${buildId}`)
					}
				}

                return <FileEntry[]>[];
			})
	)
	return files.reduce((acc, val) => acc.concat(val), []);;
}

export async function getBuildConfiguration() {
	const buildPageService: IBuildPageDataService = await SDK.getService(BuildServiceIds.BuildPageDataService);
	const buildPageData = await buildPageService.getBuildPageData();
	const buildDefinitionId = buildPageData?.definition?.id ?? 0;

	const accessToken = await SDK.getAccessToken();

	const extDataService = await SDK.getService<IExtensionDataService>(CommonServiceIds.ExtensionDataService);
	const dataManager = await extDataService.getExtensionDataManager(SDK.getExtensionContext().id, accessToken);
	const buildConfigurations = await dataManager.getValue<IBuildConfiguration[]>('buildConfigurations') ?? [];

	return buildConfigurations.find(buildConfiguration => buildConfiguration.buildDefinitionId == buildDefinitionId);
}
