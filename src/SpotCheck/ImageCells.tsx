import { ITest } from "./Models"
import { ITableColumn, SimpleTableCell, TwoLineTableCell } from "azure-devops-ui/Table";
import { ZeroData } from "azure-devops-ui/ZeroData";
import { NoVisualChanges } from "./NoVisualChanges";
import { Pill, PillSize, PillVariant } from "azure-devops-ui/Pill";
import { Image } from "azure-devops-ui/Image";
import React from "react";

export const ImageCell: React.FunctionComponent<{
    columnIndex: number,
    testColumn: ITableColumn<ITest>,
    test: ITest,
    type: 'diff' | 'baseline',
}> = ({ columnIndex, testColumn, test: tableItem, type}) =>

    <SimpleTableCell
        key={"col-" + columnIndex}
        columnIndex={columnIndex}
        tableColumn={testColumn}>
        { !!tableItem[type] ?

            <Image src={tableItem[type].url} containImage={true}></Image>

            : <ZeroData
                imageAltText="No differences"
                imagePath={`data:image/png;base64,${NoVisualChanges}`}>
            </ZeroData>
        }
    </SimpleTableCell>

export const ImageStatusCell: React.FunctionComponent<{
    columnIndex: number,
    testColumn: ITableColumn<ITest>,
    test: ITest
}> = ({ columnIndex, testColumn: tableColumn, test: test }) => {

    const success = test.status == 'pass';
    const iconName = success ? 'Accept' : 'AlertSolid';
    const color = success
        ? { red: 85, green: 163, blue: 98 }
        : { red: 205, green: 74, blue: 69 };

    return <TwoLineTableCell
        columnIndex={columnIndex}
        className="fontWeightSemiBold fontSizeM scroll-hidden wrap-text"
        key={"col-" + columnIndex}
        tableColumn={tableColumn}
        line1={
            <div>
                <Pill
                    color={color}
                    iconProps={{ iconName }}
                    variant={PillVariant.colored}
                    size={PillSize.large}>{test.name}</Pill>
            </div>
        }
        line2={
            <Image src={test.comparison.url} containImage={true}></Image>
        }
    ></TwoLineTableCell>
};
