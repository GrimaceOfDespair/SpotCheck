import { PagedList } from "azure-devops-extension-api/WebApi/WebApi";
import { BuildDefinitionsClient } from "../../Config/BuildDefinitionClient";
import { BuildRestClient } from "./Build";
import { GitRestClient } from "./Git";
import { LocationsRestClient } from "./Locations/LocationsClient";
import { BuildDefinitionReference } from "azure-devops-extension-api/Build";
import { RestClientRequestParams } from "azure-devops-extension-api/Common/RestClientBase";

const mockedBuildDefinitions = [{
    id: 100,
    name: 'Build Definition 1',
}, {
    id: 101,
    name: 'Build Definition 2',
}];

export function getClient(clientClass: { name: string}) {
    
    if (clientClass.name === 'GitRestClient') {
        return new GitRestClient({});
    }

    if (clientClass.name === 'BuildRestClient') {
        return new BuildRestClient();
    }

    if (clientClass.name === 'LocationsRestClient') {
        return new LocationsRestClient();
    }

    if (clientClass.name === 'BuildDefinitionsClient') {
        return new MockedBuildDefinitionsClient({});
    }
}

class MockedBuildDefinitionsClient extends BuildDefinitionsClient {
    protected async beginRequest<T>(requestParams: RestClientRequestParams): Promise<T> {

        return {
            headers: {
                get: (_: string) => ''
            },
            text: async () =>
                JSON.stringify(mockedBuildDefinitions)
        } as T;
    }
}