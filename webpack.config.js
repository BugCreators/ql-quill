const webpack = require("webpack");
const path = require("path");
const dir = (...args) => path.resolve(__dirname, ...args);

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const plugins = [
  new webpack.ProvidePlugin({
    "window.Quill": "quill/dist/quill.js",
    Quill: "quill/dist/quill.js",
  }),
  new MiniCssExtractPlugin({
    filename: "[name].snow.css",
    chunkFilename: "[id].css",
  }),
];

module.exports = {
  entry: {
    "ql-quill": dir("index.js"),
  },
  // devtool: "source-map",
  output: {
    path: dir("dist"),
    filename: "[name].js",
    library: "QlQuill",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        loader: "babel-loader",
        exclude: /(node_modules|bower_components)/,
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "images/[name].[hash:8].[ext]",
        },
      },
      {
        test: /\.styl$/,
        include: [dir("assets")],
        use: [MiniCssExtractPlugin.loader, "css-loader", "stylus-loader"],
      },
    ],
  },
  optimization: {
    minimizer: [new UglifyJsPlugin()],
  },
  plugins: plugins,
};
