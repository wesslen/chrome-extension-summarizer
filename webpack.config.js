const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    popup: './src/popup/popup.js',
    background: './src/background/background.js',
    options: './src/options/options.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]/[name].js'
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/popup/popup.html", to: "popup/popup.html" },
        { from: "src/popup/popup.css", to: "popup/popup.css" },
        { from: "src/options/options.html", to: "options/options.html" },
        { from: "assets", to: "assets" },
        { from: "manifest.json", to: "manifest.json" }
      ],
    }),
  ]
};