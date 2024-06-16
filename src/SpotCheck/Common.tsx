import { CommonServiceIds, IGlobalMessagesService, MessageBannerLevel } from "azure-devops-extension-api/Common";
import * as SDK from "azure-devops-extension-sdk";

export const showError = async (message: string) => {
    const globalMessagesSvc = await SDK.getService<IGlobalMessagesService>(CommonServiceIds.GlobalMessagesService);
    globalMessagesSvc.addBanner({
        level: MessageBannerLevel.error,
        customIcon: "StatusErrorFull",
        message
    });
}
