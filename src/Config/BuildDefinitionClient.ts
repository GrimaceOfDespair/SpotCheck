import { IVssRestClientOptions } from "azure-devops-extension-api";
import { BuildDefinition, BuildDefinitionReference } from "azure-devops-extension-api/Build";
import { RestClientBase } from "azure-devops-extension-api/Common/RestClientBase";
import { PagedList } from "azure-devops-extension-api/WebApi/WebApi";
import { deserializeVssJsonObject } from "azure-devops-extension-api/Common/Util/Serialization";

export class BuildDefinitionsClient extends RestClientBase {

    constructor(options: IVssRestClientOptions) {
        super(options);
    }

    public async getBuildDefinitions(project: string) {
        return this.beginRequest<Response>({
            apiVersion: "7.2-preview.7",
            method: "GET",
            routeTemplate: "{project}/_apis/build/definitions",
            routeValues: {
                project
            },
            returnRawResponse: true
        }).then(async response => {
            const body = <PagedList<BuildDefinitionReference>>await response.text().then(deserializeVssJsonObject);
            body.continuationToken = response.headers.get("x-ms-continuationtoken");
            return body;
        })
    }
}