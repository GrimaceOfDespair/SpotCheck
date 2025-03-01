# SpotCheck
[![Node.js CI](https://github.com/GrimaceOfDespair/SpotCheck/actions/workflows/node.js.yml/badge.svg)](https://github.com/GrimaceOfDespair/SpotCheck/actions/workflows/node.js.yml)

Maintain a screenshot baseline on your web application, right from Azure DevOps through the [SpotCheck Azure DevOps Extensions](https://marketplace.visualstudio.com/items?itemName=IgorKalders.spotcheck). This extension is publicly [maintained on GitHub](https://github.com/GrimaceOfDespair/SpotCheck).

Once installed, it enables an extra task within pipelines, as well as an extra UI tab for those pipelines. Through some minimal configuration, maintaining a visual basline of E2E tests becomes very accessible.

## Usage

Generate screenshots through cypress or Robot Framework.

Use [cypress-image-diff-js](https://cypress.visual-image-diff.dev/getting-started/reporting/json-report)

``` javascript
describe('Visuals', () => {
  it('Visit Google', () => {
    cy.visit('www.google.com')
    cy.compareSnapshot('home-page', 0.1)
  })
})
```

Or a custom keyword in [Robot Framework](https://robotframework.org/robotframework/latest/libraries/Screenshot.html#Take%20Screenshot)

``` robot
*** Test Cases ***
Visit Example
  Go To  http://www.example.com
  Wait Until Element Is Enabled  //h1
  Compare Snapshot  example_homepage  0.1

*** Keywords ***
Compare Snapshot
  [Arguments]  ${FileName}  ${Threshold}=0.1
  Capture Page Screenshot  ${FileName}.png
```

Generate the Cypress or Robot report within a pipeline, then use SpotCheck to process the report.

Process Robot report:
``` yaml
- task: SpotCheck@1
  inputs:
    input: '$(Build.Repository.LocalPath)/Automation/robot-output.xml'
```

Process Cypress Image Diff report:
``` yaml
- task: SpotCheck@1
  inputs:
    input: '$(Build.Repository.LocalPath)/Automation/cypress-image-diff.json'
    mode: 'cypress'
```

Process Robot report with screenshots in a subfolder without posting comments on the
related pull request, while flattening the images paths to a single parent folder.
``` yaml
- task: SpotCheck@1
  inputs:
    input: '$(Build.Repository.LocalPath)/Automation/robot-output.xml'
    baseDir: '$(Build.Repository.LocalPath)/Automation/screenshots'
    skipFeedback: true
    normalizePaths: true
```

Differences against the baseline are reported through a dedicated threadon the PR. When a difference is resolved, the thread will automatically resolve.

<img width="707" alt="PR Feedback" src="images/pull-request-feedback.png" />

The visual differences are presented on an extra tab in the build pipeline, to which the PR will link as well.

<img width="1319" alt="Visual differences" src="images/visual-differences.png" />

It only requires a few clicks to update the baseline, if a change is found to be legitimate.

<img width="921" alt="Reset baseline" src="images/reset-baseline.png" />
