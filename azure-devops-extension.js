module.exports = (env) => {

    const publisher = 'igorkalders';

    const isDevelopment = env.mode == 'development';
    const version = env.version || '1.0.0';

    const [id, name] = isDevelopment
        ? ['spotcheck-dev', 'SpotCheck Dev']
        : ['spotcheck', 'SpotCheck'];

    let manifest = {
        public: !isDevelopment,
        manifestVersion: 1,
        id,
        name,
        publisher,
        version,
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
                path: 'README.md'
            },
            license:
            {
                path: "LICENSE"
            },
        },
        links: {
            repository: {
                uri: "https://github.com/GrimaceOfDespair/SpotCheck"
            },
            issues: {
                uri: "https://github.com/GrimaceOfDespair/SpotCheck/issues"
            },
        },
        repository: {
            type: "git",
            uri: "https://github.com/GrimaceOfDespair/SpotCheck"
        },
        files: [
            {
                path: 'dist',
                addressable: true
            },
        ],
        badges: [
            {
                href: "https://github.com/GrimaceOfDespair/SpotCheck",
                uri: "https://github.com/GrimaceOfDespair/SpotCheck/actions/workflows/node.js.yml/badge.svg",
                description: "GitHub build"
            },
        ],
        scopes: [
            'vso.build',
            'vso.extension.default',
            'vso.work',
            'vso.code_write'
        ],
        screenshots: [
            {
                path: "images/pull-request-feedback.png"
            },
            {
                path: "images/visual-differences.png"
            },
            {
                path: "images/reset-baseline.png"
            },
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
