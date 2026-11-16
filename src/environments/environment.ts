
//Extract environment from hostname
// const hostname = location.hostname;
// const split =  hostname.split('.');
// const env = split.length === 3 ? 'prod' : split.length === 1 ? 'dev' : split[1];
// const domain = env === 'dev' ? '' : `${split[split.length - 2]}.${split[split.length - 1]}`;

const getComHost = () => {
  const hostname = location.hostname;
  const isDev = !hostname.includes('.');
  if (isDev) {
    return 'http://localhost:5010';
  } else {
    return `https://comm.${hostname.substring(hostname.indexOf('.') + 1)}`;
  }
}
export const environment = {
  production: location.hostname.includes("localhost") ? false : true,
  enableDebug: true,
  comHost: 
    getComHost()
    // env === 'dev'     ? 'http://localhost:5010' :          // dev
    // env === 'test'    ? `https://comm.test.${domain}` :    // test
    // env === 'staging' ? `https://comm.staging.${domain}` : // staging
    // env === 'prod'    ? `https://comm.${domain}` :         // production
    //                     `https://comm.${env}.${domain}`    // other
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
