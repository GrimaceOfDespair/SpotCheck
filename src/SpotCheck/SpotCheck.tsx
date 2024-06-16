import "./SpotCheck.scss";
import { ArtifactBuildRestClient, getArtifactsFileEntries } from "./ArtifactBuildRestClient";
import { ImageSplitter } from './Splitter';
import { NoVisualChanges } from './NoVisualChanges';

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";
import { CommonServiceIds, getClient, IColor, IProjectPageService, MessageBannerLevel, IGlobalMessagesService, IExtensionDataService, IHostNavigationService } from "azure-devops-extension-api";
import { IBuildPageDataService, BuildServiceIds, IBuildPageData, BuildDefinition, BuildRestClient } from "azure-devops-extension-api/Build";
import { FileContainerRestClient } from "azure-devops-extension-api/FileContainer";
import { LocationsRestClient } from "azure-devops-extension-api/Locations/LocationsClient";
import { GitServiceIds, IVersionControlRepositoryService } from "azure-devops-extension-api/Git";
import { GitRepository } from "azure-devops-extension-api/Git/Git";

import { Card } from "azure-devops-ui/Card";
import { Pill, PillSize, PillVariant } from "azure-devops-ui/Pill";
import { IObservableValue, ObservableValue } from "azure-devops-ui/Core/Observable";
import { ScreenSize } from "azure-devops-ui/Core/Util/Screen";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { IListItemDetails, List, ListItem, ListSelection } from "azure-devops-ui/List";
import { DetailsPanel, MasterPanel, MasterPanelHeader } from "azure-devops-ui/MasterDetails";
import { ConditionalChildren } from "azure-devops-ui/ConditionalChildren";
import { Splitter, SplitterDirection, SplitterElementPosition } from "azure-devops-ui/Splitter";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import {
    BaseMasterDetailsContext,
    bindSelectionToObservable,
    createChildLayer,
    IDetailsAreaContent,
    IMasterDetailsContext,
    IMasterDetailsContextLayer,
    IMasterPanelContent,
    MasterDetailsContext,
} from "azure-devops-ui/MasterDetailsContext";
import {
    ITableColumn,
    ITableRow,
    SimpleTableCell,
    Table,
    TwoLineTableCell,
} from "azure-devops-ui/Table";
import { TextField, TextFieldStyle } from "azure-devops-ui/TextField";
import { VssPersona } from "azure-devops-ui/VssPersona";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { ScreenSizeObserver } from "azure-devops-ui/Utilities/ScreenSize";
import { Status, Statuses, StatusSize } from "azure-devops-ui/Status";
import { ZeroData, ZeroDataActionType } from "azure-devops-ui/ZeroData";
import { Image } from "azure-devops-ui/Image";
import { ISuite, ITest, IPanelContentState, IReport } from "./Models";
import { downloadArtifact, openUpdateDialog } from "./UpdateScreenshot";
import { showRootComponent } from "../Common";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { Page } from "azure-devops-ui/Page";

var SampleData: ISuite[] = [] as ISuite[];
const artifactName = 'screenshots';

export class SpotCheckContent extends React.Component<{}, IPanelContentState> {

    constructor(props: {}) {
        super(props);
        this.state = {};
    }

    public async componentDidMount() {
        SDK.init();
        
        await SDK.ready();

        const { artifact, containerId } = await downloadArtifact(artifactName, 'output.json');
        if (!artifact) {
            return;
        }

        const locationClient = getClient(LocationsRestClient);
        const resourceArea = await locationClient.getResourceArea('79134c72-4a58-4b42-976c-04e7115f32bf');

        const report: IReport = JSON.parse(await artifact.contentsPromise);
        const baseUrl = `${resourceArea.locationUrl}_apis/resources/Containers/${containerId}/${artifactName}?itemPath=`;

        const getScreenshot = (path: string) => {
            const regexArtifactName = artifactName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            return {
                path,
                artifactName: !path ? '' : path.replace(new RegExp(`^${regexArtifactName}/`), ''),
                url: !path ? '' : baseUrl + encodeURIComponent(path)
            };
        };

        SampleData = report.suites.map(suite => ({
            ... suite,
            pass: suite.tests.filter(test => test.status == 'pass').length,
            fail: suite.tests.filter(test => test.status == 'fail').length,
            tests: suite.tests.map(test => ({
                ... test,
                pass: test.status == 'pass',
                comparison: getScreenshot(test.comparisonPath),
                diff: getScreenshot(test.diffPath),
                baseline: getScreenshot(test.baselinePath)
            }))
        }));

        this.setState({
            report,
        });
    }

    public render(): JSX.Element {
        const { report } = this.state;

        if (!report) {
            return (<ZeroData
                primaryText="No test suites found"
                imageAltText="No test suites found">
            </ZeroData>)
        }

        return (
            <MasterDetailsContext.Provider value={rootDetailsContext}>            
                <MasterPanel className="master-example-panel" />
                <DetailsPanel />
            </MasterDetailsContext.Provider>
        );
    }
}

const renderInitialRow = (
    index: number,
    item: ISuite,
    details: IListItemDetails<ISuite>,
    key?: string
): JSX.Element => {

    return (
        <ListItem
            className="master-example-row"
            key={key || "list-item" + index}
            index={index}
            details={details}
        >
            <div className="master-example-row-content flex-row flex-center h-scroll-hidden">
                <div className="flex-column text-ellipsis">
                    <Tooltip overflowOnly={true}>
                        <div className="primary-text text-ellipsis">{item.name}</div>
                    </Tooltip>
                    <Tooltip overflowOnly={true}>
                        <div className="secondary-text text-ellipsis">✔️ {item.pass} ❌ {item.fail}</div>
                    </Tooltip>
                </div>
            </div>
        </ListItem>
    );
};

const initialPayload: IMasterDetailsContextLayer<ISuite, undefined> = {
    key: "initial",
    masterPanelContent: {
        renderContent: (parentItem, initialSelectedMasterItem) => (
            <InitialMasterPanelContent initialSelectedMasterItem={initialSelectedMasterItem} />
        ),
        renderHeader: () => <MasterPanelHeader title={"Suites"} />,
        hideBackButton: true,
    },
    detailsContent: {
        renderContent: (item) => (
            <ConditionalChildren renderChildren={!!item}>
                <InitialDetailView detailItem={item} />
            </ConditionalChildren>
        ),
    },
    selectedMasterItem: new ObservableValue<ISuite>(SampleData[0]),
    parentItem: undefined,
};

const InitialMasterPanelContent: React.FunctionComponent<{
    initialSelectedMasterItem: IObservableValue<ISuite>;
}> = (props) => {
    const [initialItemProvider] = React.useState(new ArrayItemProvider(SampleData));
    const [initialSelection] = React.useState(new ListSelection({ selectOnFocus: false }));
    const masterDetailsContext = React.useContext(MasterDetailsContext);

    React.useEffect(() => {
        bindSelectionToObservable(
            initialSelection,
            initialItemProvider,
            props.initialSelectedMasterItem
        );
    });

    return (
        <List
            ariaLabel={"Engineering master list"}
            itemProvider={initialItemProvider}
            selection={initialSelection}
            renderRow={renderInitialRow}
            width="100%"
            onSelect={() => masterDetailsContext.setDetailsPanelVisbility(true)}
        />
    );
};

const InitialDetailView: React.FunctionComponent<{
    detailItem: ISuite;
}> = (props) => {
    const masterDetailsContext = React.useContext(MasterDetailsContext);
    const { detailItem } = props;

    const renderComparisonNameCell = (
        rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<ITest>,
        tableItem: ITest
    ) => {
        const success = tableItem.status == 'pass';
        const iconName = success ? 'Accept' : 'AlertSolid';
        const color = success ? { red: 85, green: 163, blue: 98 } : { red: 205, green: 74, blue: 69 };

        return (
            <TwoLineTableCell
                columnIndex={columnIndex}
                className="fontWeightSemiBold fontSizeM scroll-hidden wrap-text"
                key={"col-" + columnIndex}
                tableColumn={tableColumn}
                line1={
                    <div>
                        <Pill color={color} iconProps={{ iconName }} variant={PillVariant.colored} size={PillSize.large}>{tableItem.name}</Pill>
                    </div>
                }
                line2={
                    <Image src={tableItem.comparison.url} containImage={true}></Image>
                }
            />
        );
    };

    const renderImageCell = (type: 'diff' | 'baseline') => (
        rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<ITest>,
        tableItem: ITest
    ) => {
        return (
            <SimpleTableCell
                key={"col-" + columnIndex}
                columnIndex={columnIndex}
                tableColumn={tableColumn}
            >
                { !!tableItem[type] ?

                    <Image src={tableItem[type].url} containImage={true}></Image>

                  : <ZeroData
                        imageAltText="No differences"
                        imagePath={`data:image/png;base64,${NoVisualChanges}`}>
                    </ZeroData>
                }
            </SimpleTableCell>
        );
    };

    const columns: Array<ITableColumn<ITest>> = [
        {
            id: "comparison",
            name: "Comparison",
            width: new ObservableValue(-33),
            renderCell: renderComparisonNameCell,
        },
        {
            id: "diff",
            name: "Difference",
            width: new ObservableValue(-33),
            renderCell: renderImageCell('diff'),
        },
        {
            id: "baseline",
            name: "Baseline",
            width: new ObservableValue(-33),
            renderCell: renderImageCell('baseline')
        },
    ];

    const onRowActivated = (event: any, tableRow: ITableRow<ITest>) => {
        const newPayload = createChildLayer(
            "comparison-details",
            newMasterPanelContent,
            newDetailsContent,
            tableRow.data,
            initialPayload
        );
        masterDetailsContext.push(newPayload);
    };

    return (
        <Page className="context-details">
            <ScreenSizeObserver>
                {(screenSizeProps: { screenSize: ScreenSize }) => {
                    const showBackButton = screenSizeProps.screenSize <= ScreenSize.small;
                    return (
                        <Header
                            description={detailItem.path}
                            descriptionClassName="description-primary-text"
                            title={detailItem.name}
                            titleClassName="details-view-title"
                            titleSize={TitleSize.Large}
                            backButtonProps={
                                showBackButton
                                    ? {
                                          onClick: () =>
                                              masterDetailsContext.setDetailsPanelVisbility(false),
                                      }
                                    : undefined
                            }
                        />
                    );
                }}
            </ScreenSizeObserver>
            <div className="page-content page-content-top">
                <Card
                    className="bolt-card-no-vertical-padding"
                    contentProps={{ contentPadding: false }}
                >
                    <Table<ITest>
                        columns={columns}
                        itemProvider={new ArrayItemProvider<ITest>(detailItem.tests)}
                        showLines={true}
                        singleClickActivation={true}
                        onActivate={onRowActivated}
                    />
                </Card>
            </div>
        </Page>
    );
};

const renderNewRow = (
    index: number,
    item: ITest,
    details: IListItemDetails<ITest>,
    key?: string
): JSX.Element => {

    const icon = item.status == 'pass' ? '✔️' : '❌';

    return (
        <ListItem
            className="master-example-row"
            key={key || "list-item" + index}
            index={index}
            details={details}
        >
            <div className="master-example-row-content flex-column h-scroll-hidden wrap-text">
                <Tooltip text={item.name}>
                    <div className="primary-text text-ellipsis">{icon} {item.name}</div>
                </Tooltip>
                <Tooltip text={item.specFilename}>
                    <div className="secondary-text text-ellipsis">{item.specFilename}</div>
                </Tooltip>
            </div>
        </ListItem>
    );
};

const newMasterPanelContent: IMasterPanelContent<ITest, ISuite> = {
    renderContent: (parentItem, initiallySelectedMasterItem) => {
        return (
            <NewMasterPanelContentComponent
                parentItem={parentItem}
                initiallySelectedMasterItem={initiallySelectedMasterItem}
            />
        );
    },
    renderHeader: (parentItem) => {

        return (
            <MasterPanelHeader
                title={parentItem.name}
                subTitle={`✔️ ${parentItem.pass} ❌ ${parentItem.fail}`}
            />
        );
    },
    hideBackButton: false,
};

const NewMasterPanelContentComponent: React.FunctionComponent<{
    parentItem: ISuite;
    initiallySelectedMasterItem: IObservableValue<ITest>;
}> = (props) => {
    const { parentItem, initiallySelectedMasterItem } = props;

    const [itemProvider] = React.useState(new ArrayItemProvider(parentItem.tests));
    const [selection] = React.useState(new ListSelection({ selectOnFocus: false }));
    const listRef = React.useRef<List<ITest>>();
    React.useEffect(() => {
        bindSelectionToObservable(selection, itemProvider, initiallySelectedMasterItem);
        listRef.current;
    }, []);

    return (
        <List<ITest>
            key="new-list"
            itemProvider={itemProvider}
            selection={selection}
            onSelect={() => rootDetailsContext.setDetailsPanelVisbility(true)}
            renderRow={renderNewRow}
            width="100%"
        />
    );
};

const spotCheckActions = (test: ITest): IHeaderCommandBarItem[] => {
    if (test.pass) {
        return [];
    }

    return [
        {
            iconProps: {
                iconName: "ReceiptCheck"
            },
            id: "testCreate",
            important: true,
            onActivate: () => {
                openUpdateDialog(artifactName, test);
            },
            text: "Baseline",
            tooltipProps: {
                text: "Mark the screenshot as the new baseline"
            }
        }
    ];
};

const newDetailsContent: IDetailsAreaContent<ITest> = {
    renderContent: (detailItem) => (
        <Page className="flex-grow context-details">
            <ScreenSizeObserver>
                {(screenSizeProps: { screenSize: ScreenSize }) => {
                    const showBackButton = screenSizeProps.screenSize <= ScreenSize.small;
                    return (
                        <Header
                            description={detailItem.specPath}
                            descriptionClassName="description-primary-text"
                            title={detailItem.name}
                            titleSize={TitleSize.Large}
                            commandBarItems={spotCheckActions(detailItem)}
                            backButtonProps={
                                showBackButton
                                    ? {
                                          onClick: () =>
                                              rootDetailsContext.setDetailsPanelVisbility(false),
                                      }
                                    : undefined
                            }
                        />
                    );
                }}
            </ScreenSizeObserver>
            
            <Card className="flex-grow">
                <ImageSplitter leftImage={detailItem.comparison.url} rightImage={detailItem.baseline.url}></ImageSplitter>
            </Card>
        </Page>
    ),
};

const rootDetailsContext: IMasterDetailsContext = new BaseMasterDetailsContext(
    initialPayload,
    () => {
        alert("Triggered onExit");
    }
);

showRootComponent(<SpotCheckContent />);