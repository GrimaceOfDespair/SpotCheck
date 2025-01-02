import path from 'node:path';

const mockData = {
    buildArtifacts: <BuildArtifact[]>[{
        id: 10,
        name: 'report_1.zip',
        resource: {
            downloadUrl: path.join(__dirname, '../../Tests/build/report_1.zip'),
            data: 'container/a',
        }
    }, {
        id: 11,
        name: 'report_2.zip',
        resource: {
            downloadUrl: path.join(__dirname, '../../Tests/build/report_2.zip'),
            data: 'container/b',
        }
    }]
}
export class BuildRestClient {
    async getArtifacts(project: string, buildId: number): Promise<BuildArtifact[]>
    {
        return mockData.buildArtifacts;
    }
}

export const BuildServiceIds = {
    BuildPageDataService: "ms.vss-build-web.build-page-data-service"
}

export interface BuildArtifact {
    /**
     * The artifact ID.
     */
    id: number;
    /**
     * The name of the artifact.
     */
    name: string;
    /**
     * The actual resource.
     */
    resource: ArtifactResource;
    /**
     * The artifact source, which will be the ID of the job that produced this artifact. If an artifact is associated with multiple sources, this points to the first source.
     */
    source: string;
}

export interface ArtifactResource {
    _links: any;
    /**
     * Type-specific data about the artifact.
     */
    data: string;
    /**
     * A link to download the resource.
     */
    downloadUrl: string;
    /**
     * Type-specific properties of the artifact.
     */
    properties: {
        [key: string]: string;
    };
    /**
     * The type of the resource: File container, version control folder, UNC path, etc.
     */
    type: string;
    /**
     * The full http link to the resource.
     */
    url: string;
}