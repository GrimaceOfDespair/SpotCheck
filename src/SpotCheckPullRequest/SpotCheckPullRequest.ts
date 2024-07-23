import tl = require('azure-pipelines-task-lib/task');

 (async function() {
     try {
         const reportFile: string | undefined = tl.getInput('reportFile', true);
         console.log('Processing report:', reportFile);
     }
     catch (err:any) {
         tl.setResult(tl.TaskResult.Failed, err.message);
     }
 })();