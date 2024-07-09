export interface IPanelConfigState {
    buildConfigurations: IBuildConfiguration[]
}

export interface IBuildConfiguration {
    buildId: number,
    gitPath: string,
    artifact: string,
}