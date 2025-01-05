
import * as SDK from "azure-devops-extension-sdk";

import { IObservableValue, ObservableValue } from "azure-devops-ui/Core/Observable";
import { IListItemDetails, List, ListItem, ListSelection } from "azure-devops-ui/List";
import { DetailsPanel, MasterPanel, MasterPanelHeader } from "azure-devops-ui/MasterDetails";
import { ConditionalChildren } from "azure-devops-ui/ConditionalChildren";
import {
    BaseMasterDetailsContext,
    bindSelectionToObservable,
    IMasterDetailsContext,
    IMasterDetailsContextLayer,
    MasterDetailsContext,
} from "azure-devops-ui/MasterDetailsContext";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { ZeroData } from "azure-devops-ui/ZeroData";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { Spinner } from "azure-devops-ui/Spinner";

import * as React from "react";

import { showRootComponent } from "../Common";

import { NoVisualChanges } from './NoVisualChanges';
import { ISuite, IPanelContentState } from "./Models";

import "./SpotCheck.scss";
import { getBuildReport } from "./SuiteData";
import { TestTable } from "./TestTable";

var Suites: ISuite[] = [] as ISuite[];

export class SpotCheckContent extends React.Component<{}, IPanelContentState> {

    constructor(props: {}) {
        super(props);
        this.state = { phase: 'init' };
    }

    public async componentDidMount() {

        SDK.init();
        await SDK.ready();

        const state = await getBuildReport();

        if (state.report) {
            Suites = state.report.suites;
        }

        this.setState(state);
    }

    public render(): JSX.Element {
        const { phase, status } = this.state;

        switch (phase)
        {
            case 'init':
                return <Spinner label="Loading report">
                    </Spinner>

            case 'load-build':
            case 'load-artifact':
            case 'load-report':
            case 'done':

                if (status) {
                    return <ZeroData
                        primaryText={status}
                        imageAltText={status}
                        imagePath={`data:image/png;base64,${NoVisualChanges}`}>
                    </ZeroData>
                }
        }

        return <MasterDetailsContext.Provider value={reportContext}>
                <MasterPanel className="master-example-panel" />
                <DetailsPanel />
            </MasterDetailsContext.Provider>
    }
}

const SuiteList: React.FunctionComponent<{
    suite: IObservableValue<ISuite>;
}> = ({ suite }) => {

    const [initialItemProvider] = React.useState(new ArrayItemProvider(Suites));
    const [initialSelection] = React.useState(new ListSelection({ selectOnFocus: false }));
    const masterDetailsContext = React.useContext(MasterDetailsContext);

    React.useEffect(() => {
        bindSelectionToObservable(
            initialSelection,
            initialItemProvider,
            suite
        );
    });

    return <List
            ariaLabel={"Engineering master list"}
            itemProvider={initialItemProvider}
            selection={initialSelection}
            width="100%"
            onSelect={() =>
                masterDetailsContext.setDetailsPanelVisbility(true)}
            renderRow={(index, item, details) =>
                <SuiteDetails
                    index={index}
                    item={item}
                    details={details}>
                </SuiteDetails>}
        ></List>
};

const SuiteDetails: React.FunctionComponent<{
    index: number,
    item: ISuite,
    details: IListItemDetails<ISuite>,
}> = ({ item, index, details }) =>

    <ListItem
        className="master-example-row"
        key={"list-item" + index}
        index={index}
        details={details}>
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

const suiteContext: IMasterDetailsContextLayer<ISuite, undefined> = {
    key: "initial",
    masterPanelContent: {
        hideBackButton: true,
        renderContent: (_, suite) => (
            <SuiteList suite={suite} />
        ),
        renderHeader: () => <MasterPanelHeader title={"Suites"} />,
    },
    detailsContent: {
        renderContent: (suite) => (
            <ConditionalChildren renderChildren={!!suite}>
                <TestTable
                    suite={suite}
                    suiteContext={suiteContext}
                    onShowDetails={(doShow) =>
                        reportContext.setDetailsPanelVisbility(doShow)}
                ></TestTable>
            </ConditionalChildren>
        ),
    },
    selectedMasterItem: new ObservableValue<ISuite>(Suites[0]),
    parentItem: undefined,
};

const reportContext: IMasterDetailsContext = new BaseMasterDetailsContext(
    suiteContext,
    () => { /* onExit */ }
);

showRootComponent(<SpotCheckContent />);