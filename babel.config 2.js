module.exports = {
  presets: [
    ['next/babel'],
    ['@babel/preset-typescript', {
      allowDeclareFields: true,
      allowArrowFunctions: true,
      allowNamespaces: true,
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-typescript', {
      allowDeclareFields: true,
      allowNamespaces: true,
    }]
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-typescript', {
          allowDeclareFields: true,
          allowArrowFunctions: true,
          allowNamespaces: true,
        }]
      ]
    }
  }
};