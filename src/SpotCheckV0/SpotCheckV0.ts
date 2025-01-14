import tl = require('azure-pipelines-task-lib/task');
import { RobotFileParser } from './Report/RobotFileParser';
import path from 'node:path';
import fs from 'node:fs';
import { DiffReportCollector } from './DiffReportCollector';
import { PullRequestHandler } from './PullRequestHandler';
import { IDiffTestReport } from './Report/DiffReport';
import { ILogger } from './Report/ILogger';

function throwExpression(errorMessage: string): never {
    throw new Error(errorMessage);
}

 (async function() {
     try {
        const [ input, output, artifactName, screenshotFolder, type, baseDir ] = [
            [ 'input', '', 'specify a report file for "input"' ],
            [ 'output', 'diff-report.json' ],
            [ 'artifactName', 'screenshots' ],
            [ 'screenshotFolder', '' ],
            [ 'type', 'robot' ],
            [ 'baseDir', path.dirname(tl.getInput('input', false) ?? '') ],
        ]
        .map(([ key, defaultValue, errorMessage ]) =>
            tl.getInput(key, errorMessage !== undefined)
                ?? (errorMessage !== undefined
                    ? throwExpression(errorMessage)
                    : defaultValue));

        tl.debug(`type: ${type}`);
        tl.debug(`baseDir: ${baseDir}`);
        tl.debug(`output: ${output}`);
        tl.debug(`screenshotFolder: ${screenshotFolder}`);

        const skipFeedback = tl.getBoolInput('skipFeedback', false);
        const taskLogger: ILogger = skipFeedback ? {
            error: (_) => {},
            info: (_) => {}
        } : {
            error: (message) => tl.warning(message),
            info: (message) => tl.debug(message)
        };

        let diffReport: IDiffTestReport;
        switch (type) {
            case 'robot':

                diffReport = await new RobotFileParser(input, baseDir, taskLogger)
                    .createDiffReport();

                break;

            case 'cypress':
                const reportData = await fs.promises.readFile(input);
                diffReport = <IDiffTestReport>JSON.parse(reportData.toString());

                break;

            default:
                throw new Error(`"type" should be "robot" or "cypress", but was "${type}"`);
        }
        
        const diffReportCollector = new DiffReportCollector(output, screenshotFolder, taskLogger);

        const outputPath = await diffReportCollector.collectReport(baseDir, diffReport);
        tl.uploadArtifact('', outputPath, artifactName);

        if (!skipFeedback) {
            const prHandler = new PullRequestHandler(tl);
            prHandler.processFeedback(diffReport);
        }
     }
     catch (err:any) {
         tl.setResult(tl.TaskResult.Failed, err.message);
     }
 })();