module.exports = (options, webpack) => ({
  ...options,
  plugins: [
    ...options.plugins,
    new webpack.IgnorePlugin({
      resourceRegExp: /^@fastify\/static$/,
    }),
  ],
});
