import * as SDK from "azure-devops-extension-sdk";

import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";
import  { EditableDropdown } from 'azure-devops-ui/EditableDropdown';
import { IListBoxItem, ListBoxItemType } from "azure-devops-ui/ListBox";
import * as React from "react";
import { IPanelConfigState, IBuildConfiguration } from "./Models";
import { CommonServiceIds, IExtensionDataService, IProjectPageService } from "azure-devops-extension-api";
import { getClient } from "azure-devops-extension-api/Common";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";
import { Page } from "azure-devops-ui/Page";
import { CustomHeader, HeaderDescription, HeaderIcon, HeaderTitle, HeaderTitleArea, HeaderTitleRow, TitleSize } from "azure-devops-ui/Header";
import { Surface, SurfaceBackground } from "azure-devops-ui/Surface";
import { Card } from "azure-devops-ui/Card";
import { ITableColumn, SimpleTableCell, Table } from "azure-devops-ui/Table";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { Button } from "azure-devops-ui/Button";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { ConditionalChildren } from "azure-devops-ui/ConditionalChildren";
import { HeaderCommandBar, IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { BuildDefinitionsClient } from "./BuildDefinitionClient";
import { showInfo } from "../SpotCheck/Common";

export class RepoConfig extends React.Component<{}, IPanelConfigState> {

    private buildDefinitionList = new ObservableArray<IListBoxItem<number>>([]);

    private buildConfigurations = new ArrayItemProvider<IBuildConfiguration>([]);

    private storedBuildConfiguration: IBuildConfiguration[] = [];

    private columns: ITableColumn<IBuildConfiguration>[] = [
        {
            id: "build",
            name: "Build definition",
            renderCell: this.renderBuildDefinitionColumn.bind(this),
            width: new ObservableValue(-25)
        },
        {
            id: "gitpath",
            name: "Path in Git",
            renderCell: this.renderGitPath.bind(this),
            width: new ObservableValue(-30)
        },
        {
            id: "artifact",
            name: "Artifact name",
            renderCell: this.renderArtifactColumn.bind(this),
            width: new ObservableValue(-30)
        },
        {
            id: "actions",
            name: "",
            renderCell: this.renderCommands.bind(this),
            width: new ObservableValue(-5)
        },
    ];

    private async saveData() {
        const accessToken = await SDK.getAccessToken();
        const extDataService = await SDK.getService<IExtensionDataService>(CommonServiceIds.ExtensionDataService);
        const dataManager = await extDataService.getExtensionDataManager(SDK.getExtensionContext().id, accessToken);
        await dataManager.setValue<IBuildConfiguration[]>('buildConfigurations', this.buildConfigurations.value);
        this.storedBuildConfiguration = this.buildConfigurations.value;
    }

    private undoCommand: IHeaderCommandBarItem = {
        iconProps: {
            iconName: "Undo"
        },
        id: "reset",
        important: true,
        isPrimary: false,
        onActivate: () => {
            if (confirm("Are you sure you want to reset to the last saved state?")) {
                this.loadBuildConfigurations();
                showInfo("Stored configuration reloaded");
            }
        },
        text: "Reset"
    };
    
    private saveCommand: IHeaderCommandBarItem = {
        iconProps: {
            iconName: "Save"
        },
        id: "save",
        important: true,
        isPrimary: true,            
        onActivate: () => {
            if (confirm("Are you sure you want to save the new settings?")) {
                this.saveData().then(() => {
                    this.forceUpdate();
                    showInfo("Configuration saved");
                });
            }
        },
        text: "Save"
    }

    constructor(props: {}) {
        super(props);
    }

    public async componentDidMount() {
        SDK.init();

        await SDK.ready();

        const pps = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
        const project = await pps.getProject();
        if (project === undefined) {
            return;
        }

        const { id: projectId, name: projectName } = project;

        const buildDefinitionsClient = getClient(BuildDefinitionsClient);
        const buildDefinitions = await buildDefinitionsClient.getBuildDefinitions(projectName);
        this.buildDefinitionList.value = buildDefinitions.map((buildDefinition) => ({
            id: `${buildDefinition.id}`,
            text: buildDefinition.name,
            type: ListBoxItemType.Row,
        }));
    
        this.loadBuildConfigurations();
    }

    private async loadBuildConfigurations() {

        const accessToken = await SDK.getAccessToken();
        
        const extDataService = await SDK.getService<IExtensionDataService>(CommonServiceIds.ExtensionDataService);
        const dataManager = await extDataService.getExtensionDataManager(SDK.getExtensionContext().id, accessToken);
        const buildConfigurations = await dataManager.getValue<IBuildConfiguration[]>('buildConfigurations') ?? [];

        this.setBuildConfigurations(this.storedBuildConfiguration = buildConfigurations);
    }

    private setBuildConfigurations(buildConfigurations: IBuildConfiguration[]) {
        let newBuildConfiguration = [...buildConfigurations];
        if (newBuildConfiguration.length == 0 || newBuildConfiguration[newBuildConfiguration.length - 1].buildDefinitionId) {
            newBuildConfiguration.push({
                buildDefinitionId: 0,
                gitPath: '',
                artifact:'' });
        }
        this.buildConfigurations = new ArrayItemProvider(newBuildConfiguration);
        this.forceUpdate();
    }

    public render(): JSX.Element {

        //const disabled = JSON.stringify(this.storedBuildConfiguration) == JSON.stringify(this.buildConfigurations.value);
        const disabled = false;
        const commands: IHeaderCommandBarItem[] = [{...this.undoCommand, disabled}, {...this.saveCommand, disabled}];

        return (
            <Surface background={SurfaceBackground.neutral}>
                <Page>
                    <CustomHeader className="bolt-header-with-commandbar">
                        <HeaderIcon
                            className="bolt-table-status-icon-large"
                            iconProps={{ iconName: 'Code' }}
                            titleSize={TitleSize.Large}></HeaderIcon>
                        <HeaderTitleArea>
                            <HeaderTitleRow>
                                <HeaderTitle ariaLevel={3} className="text-ellipsis" titleSize={TitleSize.Large}>
                                    SpotCheck Configuration
                                </HeaderTitle>
                            </HeaderTitleRow>
                            <HeaderDescription><br />
                                SpotCheck is an extension that adds an extra tab to your build results. It enables
                                you to maintain a screenshot baseline from end-to-end (E2E) tests.<br />
                                <br />
                                In order for SpotCheck to be effective on a build, configure the build artifact name that
                                contains the E2E screenshots and the Git path that contains the baseline. Once configured
                                correctly, your builds will expose an extra tab containing a comparison of the baseline
                                versus the build results. Whenever E2E exposes a valid change, it's possible to update
                                the baseline image with just one click.
                            </HeaderDescription>
                        </HeaderTitleArea>
                        <HeaderCommandBar items={commands} />
                    </CustomHeader>
                    <div className="page-content page-content-top">
                        <Card className="flex-grow bolt-card-no-vertical-padding" contentProps={{ contentPadding: false }}>
                            <Table<IBuildConfiguration>
                                itemProvider={this.buildConfigurations}
                                columns={this.columns}/>
                        </Card>
                    </div>
                </Page>
            </Surface>
        );
    }

    private updateRepository(buildConfiguration: IBuildConfiguration, buildDefinitionId?: number) {

        buildConfiguration.buildDefinitionId = buildDefinitionId ?? 0;

        this.setBuildConfigurations(this.buildConfigurations.value);
    }

    private renderBuildDefinitionColumn(
        rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<IBuildConfiguration>,
        tableItem: IBuildConfiguration
        ): JSX.Element {

            if (tableItem.buildDefinitionId) {

                const buildDefinition = this.buildDefinitionList.value.find(r => Number.parseInt(r.id) == tableItem.buildDefinitionId);
                const displayRepository = buildDefinition?.text ?? `${tableItem.buildDefinitionId}`;

                return (
                    <SimpleTableCell
                        columnIndex={columnIndex}
                        tableColumn={tableColumn}
                        key={"col-" + columnIndex}>
                        <div className="flex-row scroll-hidden wrap-text">
                            <Tooltip text={displayRepository}>
                                <span>{displayRepository}</span>
                            </Tooltip>
                        </div>
                    </SimpleTableCell>
                )
            }

            return (
                <SimpleTableCell
                    columnIndex={columnIndex}
                    tableColumn={tableColumn}
                    key={"col-" + columnIndex}>
                    <EditableDropdown
                        items={this.buildDefinitionList}
                        onValueChange={item =>  this.updateRepository(tableItem, Number.parseInt(item?.id ?? ''))}
                        placeholder="Select build definition"
                    />
                </SimpleTableCell>
            )
    }

    private renderGitPath(
        rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<IBuildConfiguration>,
        tableItem: IBuildConfiguration
        ): JSX.Element {

            const gitPath = new ObservableValue<string | undefined>(tableItem.gitPath);

            return (
                <SimpleTableCell
                    columnIndex={columnIndex}
                    tableColumn={tableColumn}
                    key={"col-" + columnIndex}>
                    <TextField
                        value={gitPath}
                        onChange={(e, newValue) => (gitPath.value = tableItem.gitPath = newValue)}
                        placeholder="Git folder with baseline screenshots"
                        width={TextFieldWidth.standard}></TextField>
                </SimpleTableCell>
            )
    }

    private renderArtifactColumn(
        rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<IBuildConfiguration>,
        tableItem: IBuildConfiguration
        ): JSX.Element {

            const artifact = new ObservableValue<string | undefined>(tableItem.artifact);

            return (
                <SimpleTableCell
                    columnIndex={columnIndex}
                    tableColumn={tableColumn}
                    key={"col-" + columnIndex}>
                    <TextField
                        value={artifact}
                        onChange={(e, newValue) => (artifact.value = tableItem.artifact = newValue)}
                        placeholder="Artifact with test screenshots"
                        width={TextFieldWidth.standard}></TextField>
                </SimpleTableCell>
            )
    }

    private renderCommands(
        rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<IBuildConfiguration>,
        tableItem: IBuildConfiguration
        ): JSX.Element {

            return (
                <SimpleTableCell
                    columnIndex={columnIndex}
                    tableColumn={tableColumn}
                    key={"col-" + columnIndex}>
                    <ConditionalChildren renderChildren={!!tableItem.buildDefinitionId}>
                        <Button
                            ariaLabel="Remove configuration"
                            iconProps={{
                                iconName: 'Delete'
                            }}
                            onClick={e => {
                                e.preventDefault();
                                this.buildConfigurations.value.splice(rowIndex, 1);
                                this.setBuildConfigurations(this.buildConfigurations.value);
                            }}
                            subtle></Button>
                    </ConditionalChildren>
                </SimpleTableCell>
            )
    }
}
