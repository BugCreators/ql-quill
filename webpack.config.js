const webpack = require("webpack");
const path = require("path");
const pkg = require("./package.json");
const dir = (...args) => path.resolve(__dirname, ...args);

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const bannerPack = new webpack.BannerPlugin({
  banner:
    "Ql Quill v" + pkg.version + "\n" + "Copyright (c) 2020, Huang",
  entryOnly: true,
});

const plugins = [
  bannerPack,
  new webpack.ProvidePlugin({
    "window.Quill": "quill",
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
  resolve: {
    alias: {
      "quill-image-resize-module": dir("assets/js/image-resize.min.js"),
    },
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        loader: "babel-loader",
        exclude: /node_modules/,
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
    minimizer: [
      new UglifyJsPlugin({
        parallel: true,
        uglifyOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
  plugins: plugins,
};
