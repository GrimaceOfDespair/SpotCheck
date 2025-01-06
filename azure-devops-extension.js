module.exports = (env) => {

    const publisher = 'igorkalders';

    const isDevelopment = env.mode == 'development';

    const [id, name] = isDevelopment
        ? ['spotcheck-dev', 'SpotCheck Dev']
        : ['spotcheck', 'SpotCheck'];

    let manifest = {
        manifestVersion: 1,
        id,
        name,
        publisher,
        version: '1.0.0',
        description: 'Enable screenshots spot checks from your application right from within Azure DevOps',
        categories: [
            'Azure Pipelines'
        ],
        targets: [
            {
                id: 'Microsoft.VisualStudio.Services'
            }
        ],
        icons: {
            default: 'logo.png'
        },
        content: {
            details: {
                path: 'overview.md'
            }
        },
        files: [
            {
                path: 'dist',
                addressable: true
            }
        ],
        scopes: [
            'vso.build',
            'vso.extension.default',
            'vso.work',
            'vso.code_write'
        ],
        contributions: [
            {
                id: 'spotcheck-build',
                type: 'ms.vss-build-web.build-results-tab',
                targets: [
                    'ms.vss-build-web.build-results-view'
                ],
                properties: {
                    name: 'SpotCheck',
                    uri: 'dist/SpotCheck/SpotCheck.html',
                    order: 100,
                    height: 400
                },
                constraints: [
                    {
                        name: 'Feature',
                        properties: {
                            featureId: `${publisher}.${id}.spotcheck-toggle`
                        }
                    }
                ]
            },
            {
                id: 'spotcheck-toggle',
                type: 'ms.vss-web.feature',
                description: 'Show SpotCheck on build pipelines',
                targets: [
                    'ms.vss-web.managed-features'
                ],
                properties: {
                    name: 'SpotCheck',
                    userConfigurable: true,
                    hostConfigurable: true
                }
            },
            {
                id: 'spotcheck-config-hub',
                type: 'ms.vss-web.hub',
                targets: [
                    'ms.vss-web.project-admin-hub-group'
                ],
                properties: {
                    name: 'SpotCheck Configuration',
                    order: 30,
                    uri: 'dist/Config/Config.html'
                }
            },
            {
                id: "spotcheck-pr-task",
                type: "ms.vss-distributed-task.task",
                targets: [
                    "ms.vss-distributed-task.tasks"
                ],
                properties: {
                    name: "dist/SpotCheckV0"
                }
            }
        ]
    }

    if (isDevelopment) {
        manifest.baseUri = 'https://localhost:3000';
    }

    return manifest;
}