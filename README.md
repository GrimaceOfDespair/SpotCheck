# SpotCheck
Azure DevOps extension to support visual spot checks on E2E test.

It relies on the file format [used by Cypress image diff](https://github.com/haim-io/cypress-image-diff), but can run on Robot or other reports if transformed to the same format.

SpotCheck runs on Azure DevOps pipelines. When used in PR guards, it enables comparing the PR screenshots with the baseline, and setting the new baseline with one click.

[![Node.js CI](https://github.com/GrimaceOfDespair/SpotCheck/actions/workflows/node.js.yml/badge.svg)](https://github.com/GrimaceOfDespair/SpotCheck/actions/workflows/node.js.yml)

<img width="1319" alt="image" src="https://github.com/user-attachments/assets/294a3d03-026e-437d-9be1-493ee3386746" />

<img width="921" alt="image" src="https://github.com/user-attachments/assets/13a39875-42a5-4d77-afee-b5756b981bf2" />


# Resources
- https://stackoverflow.com/questions/50396510/make-release-def-context-menu-item-conditionally-invisible
- http://rathertech.blogspot.com/2018/05/constrained-and-dignified.html
