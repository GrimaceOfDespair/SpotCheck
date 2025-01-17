import React from "react";
import { ISuite, ITest } from "./Models";
import { Card } from "azure-devops-ui/Card";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { ScreenSize } from "azure-devops-ui/Core/Util/Screen";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { MasterPanelHeader } from "azure-devops-ui/MasterDetails";
import { IMasterDetailsContextLayer, MasterDetailsContext, createChildLayer } from "azure-devops-ui/MasterDetailsContext";
import { Page } from "azure-devops-ui/Page";
import { ITableColumn, ITableRow, Table } from "azure-devops-ui/Table";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { ScreenSizeObserver } from "azure-devops-ui/Utilities/ScreenSize";
import { ImageStatusCell, ImageCell } from "./ImageCells";
import { TestList, CompareImages } from "./TestList";
import { openUpdateDialog } from "./UpdateScreenshot";

export const TestTable: React.FunctionComponent<{
    suite: ISuite,
    suiteContext: IMasterDetailsContextLayer<ISuite, undefined>,
    onShowDetails: (doShow: boolean) => void
}> = ({ suite, suiteContext, onShowDetails }) => {

    const masterDetailsContext = React.useContext(MasterDetailsContext);

    return <Page className="context-details">

            <ScreenSizeObserver>
                {(screenSizeProps: { screenSize: ScreenSize }) =>
                    <Header
                        description={suite.path}
                        descriptionClassName="description-primary-text"
                        title={suite.name}
                        titleClassName="details-view-title"
                        titleSize={TitleSize.Large}
                        backButtonProps={
                            screenSizeProps.screenSize <= ScreenSize.small
                                ? {
                                        onClick: () =>
                                            masterDetailsContext.setDetailsPanelVisbility(false),
                                    }
                                : undefined
                        }
                    ></Header>
                }
            </ScreenSizeObserver>

            <div className="page-content page-content-top">
                <Card
                    className="bolt-card-no-vertical-padding"
                    contentProps={{ contentPadding: false }}>
                    <Table<ITest>
                        columns={testColumns}
                        itemProvider={new ArrayItemProvider<ITest>(suite.tests)}
                        showLines={true}
                        singleClickActivation={true}
                        onActivate={onActivateTest(suiteContext, onShowDetails)}
                    />
                </Card>
            </div>
        </Page>
};

const onActivateTest = (
    suiteContext: IMasterDetailsContextLayer<ISuite, undefined>,
    onShowDetails: (doShow: boolean) => void) => {

    const masterDetailsContext = React.useContext(MasterDetailsContext);

    return (event: any, tableRow: ITableRow<ITest>) => {
        masterDetailsContext.push(createChildLayer(
            "comparison-details",
            {
                hideBackButton: false,
                renderContent: (suite, initiallySelectedMasterItem) => (
                    <TestList
                        suite={suite}
                        test={initiallySelectedMasterItem}
                        onSelectTest={() =>
                            onShowDetails(true)} />
                ),
                renderHeader: (parentItem) => (
                    <MasterPanelHeader
                        title={parentItem.name}
                        subTitle={`✔️ ${parentItem.pass} ❌ ${parentItem.fail}`} />
                ),
            },
            {
                renderContent: (test) => (
                    <CompareImages test={test}
                        onNavigateBack={() =>
                            onShowDetails(false)}
                        onUpdateScreenshot={() =>
                            openUpdateDialog(test)}>
                    </CompareImages>)
            },
            tableRow.data,
            suiteContext
        ));
    };

}

const testColumns: Array<ITableColumn<ITest>> = [
    {
        id: "comparison",
        name: "Comparison",
        width: new ObservableValue(-33),
        renderCell: (_, columnIndex, testColumn, test) =>
            <ImageStatusCell
                key={`comparison-${test.name}`}
                columnIndex={columnIndex}
                testColumn={testColumn}
                test={test}></ImageStatusCell>,
    },
    {
        id: "diff",
        name: "Difference",
        width: new ObservableValue(-33),
        renderCell: (_, columnIndex, testColumn, test) =>
            <ImageCell
                key={`diff-${test.name}`}
                columnIndex={columnIndex}
                testColumn={testColumn}
                test={test}
                type="diff"></ImageCell>,
    },
    {
        id: "baseline",
        name: "Baseline",
        width: new ObservableValue(-33),
        renderCell: (_, columnIndex, testColumn, test) =>
            <ImageCell
                key={`baseline-${test.name}`}
                columnIndex={columnIndex}
                testColumn={testColumn}
                test={test}
                type="baseline"></ImageCell>,
    },
];

