const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

class PatchAzureTaskLib {
    apply (compiler) {
      compiler.hooks.normalModuleFactory.tap('PatchAzureTaskLib', factory => {
        factory.hooks.parser.for('javascript/auto').tap('PatchAzureTaskLib', (parser, options) => {
          parser.hooks.call.for('require').tap('PatchAzureTaskLib', expression => {
            // This is a SyncBailHook, so returning anything stops the parser, and nothing allows to continue
            if (expression.arguments.length !== 1 || expression.arguments[0].type === 'Literal') {
              return
            }

            // Leave dynamic import of task resources alone
            if (expression.arguments[0].name == 'resourceFile') {
              return true;
            }
          });
        });
      });
    }
  }
  
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
        new PatchAzureTaskLib(),
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
