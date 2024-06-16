import "es6-promise/auto";
import * as SDK from "azure-devops-extension-sdk";
import { CommonServiceIds, IGlobalMessagesService, IHostPageLayoutService } from "azure-devops-extension-api";

SDK.register("BaselineCommandService", () => {
    async function runCommand(commandName: string, testArgument: string) {
        const dialogService = await SDK.getService<IHostPageLayoutService>(CommonServiceIds.HostPageLayoutService);
        dialogService.openMessageDialog(`Running the ${commandName} command for ${testArgument}`, {
            showCancel: false,
            title: "Using screenshot as new baseline",
            okText: "Ok",
            onClose: async () => {
                const messagesService = await SDK.getService<IGlobalMessagesService>(CommonServiceIds.GlobalMessagesService);
                messagesService.closeBanner();
            }
        });
    }
    return {
        updateBaselineCommand: async (testArgument: string) => {
            runCommand("UpdateBaseline", testArgument);
        }
    }
});

SDK.init();