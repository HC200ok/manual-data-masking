const NODE_ENV = process.env.NODE_ENV
const path = require("path")

module.exports = {
    entry: "./src/index.js",
    output: {
        filename: "manualDataMasking.min.js",
        path: path.resolve(__dirname, "dist"),
        library: {
            name: 'manualDataMasking',
            type: 'umd',
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                "@babel/preset-env",
                            ],
                        },
                    },
                ],
            },
            {
                test: /\.scss$/,
                use: ["style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            url: false,
                            // sourceMap: NODE_ENV === "development",
                            // 0 => no loaders (default);
                            // 1 => postcss-loader;
                            // 2 => postcss-loader, sass-loader
                            importLoaders: 2
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            // sourceMap: NODE_ENV === "development"
                        },
                    },
                ],
            },
        ],
    },
    target: ["web", "es5"],
};