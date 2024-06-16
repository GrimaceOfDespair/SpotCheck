
export interface FileEntry {
    name: string;
    uri: string;
    artifactName: string;
    containerId: string;
    filePath: string;
    buildId: number;
    contentsPromise: Promise<string>;
}

export interface IArtifactData {
    dataProviderSharedData: any;
    dataProviders: IDataProviders;
}

export interface IDataProviders {
    "ms.vss-web.component-data": any;
    "ms.vss-web.shared-data": any;
    "ms.vss-build-web.run-artifacts-data-provider": IBuildArtifacts;
}

export interface IBuildArtifacts {
    buildId: number;
    buildNumber: string;
    definitionId: number;
    definitionName: string;
    items: IBuildArtifact[];
}

export interface IBuildArtifact {
    artifactId: number;
    name: string;
    sourcePath: string;
    size: number;
    type: 'file' | 'directory';
    items: IBuildArtifact[] | null;
}
