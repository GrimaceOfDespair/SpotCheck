const path = require("path");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");

// Webpack entry points. Mapping from resulting bundle name to the source file entry.
const entries = {};

// Loop through subfolders in the "src" folder and add an entry for each one
const codeDir = path.join(__dirname, "src");
fs.readdirSync(codeDir).filter(dir => {
    switch (dir) {
        case '__mocks__':
        case 'Tests':
            return;
    }

    if (fs.statSync(path.join(codeDir, dir)).isDirectory()) {
        entries[dir] = "./" + path.relative(process.cwd(), path.join(codeDir, dir, dir));
    }
});

module.exports = (env, argv) => ({
    entry: entries,
    output: {
        filename: "[name]/[name].js",
        publicPath: "/dist/",
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        alias: {
            "azure-devops-extension-sdk": path.resolve("node_modules/azure-devops-extension-sdk")
        },
    },
    stats: {
        warnings: false
    },
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
                { from: "*.*", context: "screenshots" }
            ]
        })
    ],
    ...(env.WEBPACK_SERVE
        ? {
            devtool: 'inline-source-map',
            devServer: {
                server: 'https',
                port: 3000
            }
        }
        : {})
});
