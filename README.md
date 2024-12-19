# SpotCheck
Azure DevOps extension to support visual spot checks on E2E test.

It relies on the file format [used by Cypress image diff](https://github.com/haim-io/cypress-image-diff), but can run on Robot or other reports if transformed to the same format.

SpotCheck runs on Azure DevOps pipelines. When used in PR guards, it enables comparing the PR screenshots with the baseline, and setting the new baseline with one click.

[![Node.js CI](https://github.com/GrimaceOfDespair/SpotCheck/actions/workflows/node.js.yml/badge.svg)](https://github.com/GrimaceOfDespair/SpotCheck/actions/workflows/node.js.yml)

<img width="1319" alt="image" src="https://github.com/user-attachments/assets/294a3d03-026e-437d-9be1-493ee3386746" />

<img width="608" alt="image" src="https://github.com/user-attachments/assets/4db38604-7a49-401d-a80a-8a84507d39c5" />

# Resources
- https://stackoverflow.com/questions/50396510/make-release-def-context-menu-item-conditionally-invisible
- http://rathertech.blogspot.com/2018/05/constrained-and-dignified.html
