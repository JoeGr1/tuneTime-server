### Welcome

Welcome to the tuneTime. repositery. this readme. covers set up for the who application including this server repository as well as the client repository, which can be fouond at: https://github.com/JoeGr1/tuneTime-client

tuneTime is a song sharing app desiggn for sharing users surrnelty listening to. this feature uses spotifies Oauth2.0 to get permisions. a spotify account is needed for the development and use of this app. For developemnt, all data will be stored locally to yoour local Databse.

### Database

ensure that your local machine can run a MySQL2 database, and create a database called "tuneTime_db" and update values in .env file to your own details.

### For Seeding data 'npm run full'

Check package.json for knex scripts regarding migrations, rollback, and seeding. 'npm run full' will rollback last migration, migrate new tables, and then seed the data into the new tables.

### for .env

for client and server .env values please contact JoeGr1 (repository creater). He will provide the sensitive data needed to run the app (DO NOT SHARE THIS DATA AT ALL, DO NOT CHANGE .env.example)

### npm install

after cloning reposittry to local device, ensure you install all the rlevant librabris used in both client folder and server folder.

you can see a list of libraires used in package.json under 'dependencies', if in doubt run npm i <dependency>.
