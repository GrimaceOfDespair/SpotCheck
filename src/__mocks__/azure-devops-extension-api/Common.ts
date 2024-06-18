import { BuildRestClient } from "./Build";
import { GitRestClient } from "./Git";
import { LocationsRestClient } from "./Locations/LocationsClient";

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
}
