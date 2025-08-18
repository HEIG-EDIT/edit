// .lintstagedrc.js
// See https://nextjs.org/docs/basic-features/eslint#lint-staged for details

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames.join(" ")}`;

const formatCommand = (filenames) =>
  `prettier --write --ignore-unknown ${filenames.join(" ")}`;

module.exports = {
  "*.{js,jsx,ts,tsx}": [buildEslintCommand, formatCommand],
};
