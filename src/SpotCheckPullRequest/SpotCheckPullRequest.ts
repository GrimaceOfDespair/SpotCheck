import tl = require('azure-pipelines-task-lib/task');
import { RobotFileParser } from './Report/RobotFileParser';
import path from 'node:path';
import fs from 'node:fs';
import { DiffReportCollector } from './DiffReportCollector';
import { PullRequestHandler } from './PullRequestHandler';
import { IDiffTestReport } from './Report/DiffReport';

function throwExpression(errorMessage: string): never {
    throw new Error(errorMessage);
}

 (async function() {
     try {
        const [ input, artifactName, type, baseDir ] = [
            [ 'input', '', 'specify a report file for "input"' ],
            [ 'artifactName', 'screenshots' ],
            [ 'type', 'robot' ],
            [ 'baseDir', path.dirname(tl.getInput('input', false) ?? '') ],
        ]
        .map(([ key, defaultValue, errorMessage ]) =>
            tl.getInput(key, errorMessage !== undefined)
                ?? (errorMessage !== undefined
                    ? throwExpression(errorMessage)
                    : defaultValue));

        const diffReportCollector = new DiffReportCollector();

        tl.debug(`type: ${type}`);
        tl.debug(`baseDir: ${baseDir}`);

        let diffReport: IDiffTestReport;
        switch (type) {
            case 'robot':

                diffReport = await new RobotFileParser(input, baseDir)
                    .createDiffReport();

                break;

            case 'cypress':
                const reportData = await fs.promises.readFile(input);
                diffReport = <IDiffTestReport>JSON.parse(reportData.toString());

                break;

            default:
                throw new Error(`"type" should be "robot" or "cypress", but was "${type}"`);
        }
        
        const output = await diffReportCollector.collectReport(baseDir, diffReport);
        tl.uploadArtifact('', output, artifactName);

        const skipFeedback = tl.getBoolInput('skipFeedback', false);
        if (!skipFeedback) {
            const prHandler = new PullRequestHandler(tl);
            prHandler.processFeedback(diffReport);
        }
     }
     catch (err:any) {
         tl.setResult(tl.TaskResult.Failed, err.message);
     }
 })();