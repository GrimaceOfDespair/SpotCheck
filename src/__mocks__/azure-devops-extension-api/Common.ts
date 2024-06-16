import { BuildRestClient } from "./Build";
import { GitRestClient } from "./Git";
import { LocationsRestClient } from "./Locations";

export function getClient(clientClass: any) {
    
    if (typeof clientClass === typeof GitRestClient) {
        return new GitRestClient({});
    }

    if (typeof clientClass === typeof BuildRestClient) {
        return new BuildRestClient();
    }

    if (typeof clientClass === typeof LocationsRestClient) {
        return new LocationsRestClient();
    }
}
