const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

// Webpack entry points. Mapping from resulting bundle name to the source file entry.
const codeDir = path.join(__dirname, "src");

[webEntry, taskEntry] = [
    ["Config", "SpotCheck"],
    ["SpotCheckPullRequest"]
].map((components) => components
    .reduce((agg, component) => {
        agg[component] = `./src/${component}/${component}`;
        return agg;
    },
        {}));

const common = (clean, alias) => ({
    output: {
        filename: "[name]/[name].js",
        publicPath: "/dist/",
        clean,
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        alias,
    },
    stats: {
        warnings: false
    }
});

const taskConfig = (env, argv) => ({
    ...common(false, {
        "azure-pipelines-task-lib": path.resolve("src/SpotCheckPullRequest/node_modules/azure-pipelines-task-lib"),
    }),
    entry: taskEntry,
    target: 'node',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader"
            },
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: "**/task.json", context: "src" },
                { from: "lib.json", context: "src/SpotCheckPullRequest/node_modules/azure-pipelines-task-lib", to: "SpotCheckPullRequest" },
                { from: "Strings/**/*.resjson", context: "src/SpotCheckPullRequest/node_modules/azure-pipelines-task-lib", to: "SpotCheckPullRequest" },
            ]
        })
    ],
});

const webConfig = (env, argv) => ({
    ...common(true, {
        "azure-devops-extension-sdk": path.resolve("node_modules/azure-devops-extension-sdk"),
    }),
    entry: webEntry, 
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                type: 'asset/inline'
            },
            {
                test: /\.html$/,
                type: 'asset/resource'
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: "**/*.html", context: "src" },
                { from: "**/task.json", context: "src" },
            ]
        })
    ],
    ...(env.WEBPACK_SERVE
        ? {
            devtool: 'eval-cheap-source-map',
            devServer: {
                server: 'https',
                port: 3000
            }
        }
        : {}),
});

module.exports = (env, argv) => (
    env.WEBPACK_SERVE ?
        [ webConfig(env, argv) ] :
        [ taskConfig(env, argv), webConfig(env, argv) ]);
