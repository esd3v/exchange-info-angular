module.exports = {
  '*.{js,ts,tsx}': [
    // https://github.com/okonet/lint-staged/issues/825#issuecomment-620018284
    () => 'npm run check-types',
    () => 'npm run lint:fix',
  ],
};
