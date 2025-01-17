
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
import { SuiteList } from './SuiteList';

export class SpotCheckContent extends React.Component<{}, IPanelContentState> {

    _suites: ISuite[] = [];

    constructor(props: {}) {
        super(props);
        this.state = { phase: 'init' };
    }

    public async componentDidMount() {

        SDK.init();
        await SDK.ready();

        const state = await getBuildReport();

        if (state.report) {
            this._suites = state.report.suites;
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

        const suiteContext: IMasterDetailsContextLayer<ISuite, undefined> = {
            key: "initial",
            masterPanelContent: {
                hideBackButton: true,
                renderContent: (_, suite) => (
                    <SuiteList suites={this._suites} suite={suite} />
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
            selectedMasterItem: new ObservableValue<ISuite>(this._suites[0]),
            parentItem: undefined,
        };
        
        const reportContext: IMasterDetailsContext = new BaseMasterDetailsContext(
            suiteContext,
            () => { /* onExit */ }
        );
        
        return <MasterDetailsContext.Provider value={reportContext}>
                <MasterPanel className="master-example-panel" />
                <DetailsPanel />
            </MasterDetailsContext.Provider>
    }
}

showRootComponent(<SpotCheckContent />);