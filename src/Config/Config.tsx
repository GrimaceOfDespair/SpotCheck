import { getClient } from "azure-devops-extension-api/Common";
import { LocationsRestClient } from "azure-devops-extension-api/Locations/LocationsClient";

import * as SDK from "azure-devops-extension-sdk";

import { showRootComponent } from "../Common";

import React from "react";
import { IPanelConfigState } from "./Models";
import { RepoConfig } from "./RepoConfig";

showRootComponent(<RepoConfig />);