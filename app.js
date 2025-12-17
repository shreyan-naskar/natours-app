const express = require('express');
const morgan = require('morgan');
const fs = require('fs');

const tourRouter = require('./routers/tourRoutes');
const userRouter = require('./routers/userRoutes');
const app = express();

const port = 5000;

// GLOBAL MIDDLEWARES
app.use(morgan('dev'));
app.use(express.json());

// ROUTER MIDDLEWARES
// Tours
app.use('/api/v1/tours', tourRouter);

// Users
app.use('/api/v1/users', userRouter);

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
