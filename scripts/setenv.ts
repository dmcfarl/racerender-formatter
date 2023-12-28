const { writeFile } = require('fs');
const { argv } = require('yargs');

// read environment variables from .env file
require('dotenv').config();
// read the command line arguments passed with yargs
const environment = argv.environment;
const isProduction = environment === 'prod';
const targetPath = isProduction
   ? `./src/environments/environment.prod.ts`
   : `./src/environments/environment.ts`;

// Verify Google Maps API Key is available
if (!process.env.GOOGLE_MAPS_API_KEY) {
   console.error('All the required environment variables were not provided!');
   process.exit(-1);
}

// Access environment variables with process.env using dotenv
const environmentFileContent = `
export const environment = {
   production: ${isProduction},
   GOOGLE_MAPS_API_KEY: "${process.env.GOOGLE_MAPS_API_KEY}"
};
`;
// write the content to the respective file
writeFile(targetPath, environmentFileContent, function (err) {
   if (err) {
      console.log(err);
   }
   console.log(`Wrote variables to ${targetPath}`);
});