export interface IPanelConfigState {
    buildConfigurations: IBuildConfiguration[]
}

export interface IBuildConfiguration {
    buildDefinitionId: number,
    gitPath: string,
    artifact: string,
}