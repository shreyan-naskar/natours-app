# Natours : Back-end Practice app

## Stack

- Backend code
  1. Node.js
  2. Express.js
- Database
  1. Mongo DB
  2. Mongoose
- API Testing
  1. Postman
  2. Thunder Client

## Learnings

1. RESTful API design
2. HTTP methods
3. MongoDB Schemas, Mongoose
4. Error Handling
5. Authentication
6. Authorization
7. Security

## API Features

1. Filtering
2. Field limiting
3. Sorting
4. Pagination

## Database Modelling

![database-modelling](/github-statics/image.png)

## Run in your local environment

```
// clone the repoisitory
git clone https://github.com/shreyan-naskar/natours-app.git

// install dependencies
npm install

// start dev server
npm run dev

```

## .env contents

```
PORT=<port-number>
NODE_ENV=development
// DB_PASWORD to be replaced at runtime
DB_PASSWORD=<database-user-password>
// <PASSWORD> will be replaced by DB_PASSWORD at runtime
DB=mongodb+srv://database-user-name<>:<PASSWORD>@<project-name>.rxg4pjs.mongodb.net/<cluster-name>?appName=<app-name>

```
