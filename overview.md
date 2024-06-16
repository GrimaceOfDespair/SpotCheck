# SpotCheck

Tired of manual spot checks in your QA process? Then SpotCheck might your answer.

# Why?

In a regular sofware pipeline, every batch of code changes gets scrutinized by a QA process.
A typical challenge is when some kind of manual validations need to take place before moving to production.
While nothing subsitutes thorough manual testing, automating [toil](https://sre.google/sre-book/eliminating-toil/) can free up QA resources to do the hard work.

# How?

SpotCheck hooks in on your Azure DevOps pipeline as an extra tab to your builds. It picks up cypress-image-diff reports from the build artifacts and presents them right from the Azure DevOps UI. Any screenshot that is different from the baseline, can be easily compared and updated through the UI.

# Prerequisites

- Install the SpotCheck extension
- Publish a build artifact called "screenshots" containing a output.json and relevant screenshots from a cypress-image-diff report
- If you configured a repository folder for your baseline, it will be possible to update baseline images from the SpotCheck page
