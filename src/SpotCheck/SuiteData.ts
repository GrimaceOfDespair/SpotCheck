import { getBuildConfiguration } from "./ArtifactBuildRestClient";
import { FileEntry } from "./ArtifactModels";
import { IPanelContentState, IReport } from "./Models";
import { NoVisualChanges } from "./NoVisualChanges";
import { downloadArtifacts } from "./UpdateScreenshot";

export async function getBuildReport(): Promise<IPanelContentState> {

    const buildConfiguration = await getBuildConfiguration();
    if (!buildConfiguration) {
        return {
            phase: 'load-build',
            status: `No build found`
        };
    }

    const { artifact: artifactName } = buildConfiguration;
    const artifacts = await downloadArtifacts(artifactName);

    if (!artifacts || artifacts.length == 0) {
        return {
            phase: 'load-artifact',
            status: `Build artifact "${artifactName}" not found`
        };
    }

    const reportJson = artifacts.find(artifact => artifact.name == 'diff-report.json');
    if (!reportJson) {
        return {
            phase: 'load-build',
            status: `No diff-report.json found in build artifact "${artifactName}"`
        };
    }

    const rawReport: IReport = JSON.parse(await reportJson.contentsPromise);

    const suites = await Promise.all(rawReport.suites.map(async suite => ({
        ... suite,
        pass: suite.tests.filter(test => test.status == 'pass').length,
        fail: suite.tests.filter(test => test.status == 'fail').length,
        tests: await Promise.all(suite.tests.map(async test => ({
            ... test,
            pass: test.status == 'pass',
            comparison: await getScreenshot(test.comparisonPath, artifacts, artifactName),
            diff: await getScreenshot(test.diffPath, artifacts, artifactName),
            baseline: await getScreenshot(test.baselinePath, artifacts, artifactName)
        })))
    })));

    return {
        phase: 'done',
        status: rawReport.total ? undefined : 'Test report is empty',
        report: { ...rawReport, suites }
    }
}

const getScreenshot = async (path: string, artifacts: FileEntry[], artifactName: string) => {
    const regexArtifactName = artifactName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    const artifact = artifacts.find(artifact => artifact.name == path);
    const url = !artifact
        ? `data:image/png;base64,${NoVisualChanges}`
        : `data:image/png;base64,${btoa(await artifact.contentsPromise)}`;

    return {
        path,
        artifactName: !path
            ? ''
            : path.replace(new RegExp(`^${regexArtifactName}/`), ''),
        url,
    };
};

