export class BuildRestClient {
    getArtifacts(project: string, buildId: number): Promise<BuildArtifact[]>
    {
        return new Promise(() => {
            return [];
        });
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