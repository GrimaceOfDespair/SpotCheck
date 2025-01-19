import { IVssRestClientOptions } from "azure-devops-extension-api/Common";
import { RestClientRequestParams } from "azure-devops-extension-api/Common/RestClientBase";

export class RestClientBase {
    constructor(options: IVssRestClientOptions) {
    }

    protected async beginRequest<T>(requestParams: RestClientRequestParams): Promise<T> {
        return {} as T;
    }
}