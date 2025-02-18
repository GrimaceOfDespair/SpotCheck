import { IObservableValue } from "azure-devops-ui/Core/Observable";
import { ListSelection, List, ListItem, IListItemDetails } from "azure-devops-ui/List";
import { MasterDetailsContext, bindSelectionToObservable } from "azure-devops-ui/MasterDetailsContext";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import React from "react";
import { ISuite } from "./Models";
import { Tooltip } from "azure-devops-ui/TooltipEx";

export const SuiteList: React.FunctionComponent<{
    suites: ISuite[],
    suite: IObservableValue<ISuite>;
}> = ({ suites, suite }) => {

    const [initialItemProvider] = React.useState(new ArrayItemProvider(suites));
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

