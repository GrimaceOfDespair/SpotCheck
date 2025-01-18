import { ResourceAreaInfo } from "azure-devops-extension-api/Locations/Locations";

export class LocationsRestClient {
    getResourceArea = async function(areaId: string, enterpriseName?: string, organizationName?: string): Promise<ResourceAreaInfo> {
        return {
            locationUrl: 'http://example.com/tfs/FakeTeam/',
        } as ResourceAreaInfo;
    }
}