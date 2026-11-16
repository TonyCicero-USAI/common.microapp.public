// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-spec-reporter')
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      captureConsole: false // <- show console logs or not
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, './coverage/test'),
      reports: ['html', 'lcovonly', 'text-summary' ],
      // reports: ['html', 'lcovonly', 'text', 'text-summary' ],
      fixWebpackSourcePaths: true,
      thresholds: {
        emitWarning: false, // <- this is important to make karma fail
        global: {
          statements: 20,
          branches: 20,
          functions: 20,
          lines: 20
        }
      }
    },
    reporters: [ 'kjhtml', 'spec', 'coverage-istanbul'],
    // reporters: ['progress', 'kjhtml', 'spec'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Chrome'],
    singleRun: true,
    restartOnFileChange: true
  });
};
