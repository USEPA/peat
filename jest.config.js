module.exports = {
  verbose: true,
  preset: "jest-puppeteer",
  resolve: {
    alias: {
      path: require.resolve("path-browserify"),
    },
  },
};
