const webpack = require("webpack");
const path = require("path");
const pkg = require("./package.json");
const dir = (...args) => path.resolve(__dirname, ...args);

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const isEnvProduction = process.env.NODE_ENV === "production";

const bannerPack = new webpack.BannerPlugin({
  banner: "Ql Quill v" + pkg.version + "\n" + "Copyright (c) 2020, Huang",
  entryOnly: true,
});

const plugins = [
  bannerPack,
  new MiniCssExtractPlugin({
    filename: "[name].snow.css",
    chunkFilename: "[id].css",
  }),
];

module.exports = {
  mode: process.env.NODE_ENV,
  target: process.env.NODE_ENV === "development" ? "web" : false,
  entry: {
    "ql-quill": dir("index.js"),
  },
  devtool: isEnvProduction ? false : "source-map",
  output: {
    path: dir("dist"),
    filename: "[name].js",
    library: "QlQuill",
    libraryTarget: "umd",
    clean: true,
  },
  resolve: {
    alias: {
      "@icons": dir("assets/icons"),
      "@plugin": dir("plugin"),
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
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "images/[name].[hash:8].[ext]",
        },
      },
      {
        test: /\.svg$/,
        use: "raw-loader",
      },
      {
        test: /\.styl$/,
        include: [dir("assets")],
        use: [MiniCssExtractPlugin.loader, "css-loader", "stylus-loader"],
      },
    ],
  },
  optimization: {
    minimize: isEnvProduction,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
  },
  plugins: plugins,
  devServer: {
    open: true,
    port: 8080,
    hot: true,
    static: path.join(__dirname, "demo"),
  },
};
