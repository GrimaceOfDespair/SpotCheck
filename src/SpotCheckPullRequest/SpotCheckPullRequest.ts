import tl = require('azure-pipelines-task-lib/task');
import { ToolRunner } from 'azure-pipelines-task-lib/toolrunner';
import { RobotFileParser } from './Report/RobotFileParser';
import path from 'node:path';
import { DiffReportCollector } from './DiffReportCollector';

function throwExpression(errorMessage: string): never {
    throw new Error(errorMessage);
}

 (async function() {
     try {
        const input: string = tl.getInput('input', true) ?? throwExpression(`specify a report file for "input"`);
        const mode = tl.getInput('mode', false) ?? 'robot';
        const baseDir = tl.getInput('baseDir', false) ?? path.dirname(input);
        const screenshotFolder = tl.getInput('screenshots', false) ?? (path.dirname(input) + '/screenshots');

        const diffReportCollector = new DiffReportCollector();

        let output: string;
        switch (mode) {
            case 'robot':
                const diffReport = await new RobotFileParser(input, baseDir)
                    .createDiffReport(screenshotFolder);

                output = await diffReportCollector.collectReport(baseDir, diffReport);

                break;

            case 'cypress':
                output = await diffReportCollector.collectReportFile(input);

                break;

            default:
                throw new Error(`"mode" should be "robot" or "cypress", but was "${mode}"`);
                break;
        }

        tl.uploadArtifact('report', output, 'reportFile');
     }
     catch (err:any) {
         tl.setResult(tl.TaskResult.Failed, err.message);
     }
 })();