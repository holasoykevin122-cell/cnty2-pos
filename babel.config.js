module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Debe ir al final. Habilita los worklets de Reanimated 4 (animaciones).
    plugins: ['react-native-worklets/plugin'],
  };
};
