import { IListItemDetails, IListRow, List, ListItem, ListSelection } from "azure-devops-ui/List";
import { ISuite, ITest } from "./Models";
import React from "react";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { IObservableValue } from "azure-devops-ui/Core/Observable";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { bindSelectionToObservable } from "azure-devops-ui/MasterDetailsContext";
import { ScreenSizeObserver } from "azure-devops-ui/Utilities/ScreenSize";
import { Page } from "azure-devops-ui/Page";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { ScreenSize } from "azure-devops-ui/Core/Util/Screen";
import { Card } from "azure-devops-ui/Card";
import { ImageSplitter } from "./Splitter";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";

export const TestList: React.FunctionComponent<{
    suite: ISuite;
    test: IObservableValue<ITest>;
    onSelectTest?: (event: React.SyntheticEvent<HTMLElement>, testRow: IListRow<ITest>) => void;
}> = (props) => {
    const { suite, test, onSelectTest } = props;

    const [itemProvider] = React.useState(new ArrayItemProvider(suite.tests));
    const [selection] = React.useState(new ListSelection({ selectOnFocus: false }));
    const listRef = React.useRef<List<ITest>>();
    React.useEffect(() => {
        bindSelectionToObservable(selection, itemProvider, test);
        listRef.current;
    }, []);

    return (
        <List<ITest>
            key="new-list"
            itemProvider={itemProvider}
            selection={selection}
            onSelect={onSelectTest}
            renderRow={(index, test, testDetails) =>
                <TestDetails
                    test={test}
                    index={index}
                    details={testDetails}>
                </TestDetails>}
            width="100%"
        />
    );
};

export const TestDetails: React.FunctionComponent<{
    index: number,
    test: ITest,
    details: IListItemDetails<ITest>
}> = ({ index, test, details }) => {

    const icon = test.status == 'pass' ? '✔️' : '❌';

    return <ListItem
        className="master-example-row"
        key={"list-item" + index}
        index={index}
        details={details}>
        <div className="master-example-row-content flex-column h-scroll-hidden wrap-text">
            <Tooltip text={test.name}>
                <div className="primary-text text-ellipsis">{icon} {test.name}</div>
            </Tooltip>
            <Tooltip text={test.specFilename}>
                <div className="secondary-text text-ellipsis">{test.specFilename}</div>
            </Tooltip>
        </div>
    </ListItem>
};

export const CompareImages: React.FunctionComponent<{
    test: ITest,
    onNavigateBack: () => void,
    onUpdateScreenshot: () => void
 }> = ({ test, onNavigateBack, onUpdateScreenshot })=> (

    <Page className="flex-grow context-details">
        <ScreenSizeObserver>
            {(screenSizeProps: { screenSize: ScreenSize }) => {
                const showBackButton = screenSizeProps.screenSize <= ScreenSize.small;
                return (
                    <Header
                        description={test.specPath}
                        descriptionClassName="description-primary-text"
                        title={test.name}
                        titleSize={TitleSize.Large}
                        commandBarItems={GetTestCommands(test, onUpdateScreenshot)}
                        backButtonProps={
                            showBackButton
                                ? { onClick: onNavigateBack }
                                : undefined
                        }
                    />
                );
            }}
        </ScreenSizeObserver>
        
        <Card className="flex-grow">
            <ImageSplitter
                leftImage={test.comparison.url}
                rightImage={test.baseline.url}></ImageSplitter>
        </Card>
    </Page>
);

const GetTestCommands = (
    test: ITest,
    onUpdate: (test: ITest) => void): IHeaderCommandBarItem[] => {

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
            text: "Baseline",
            tooltipProps: {
                text: "Mark the screenshot as the new baseline"
            },
            onActivate: () =>
                onUpdate(test),
        }
    ];
};
