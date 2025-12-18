const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const connectDb = require('./config/dbConnection');

connectDb();

// const testTour = new Tour({
//   name: 'heloo1',
//   rating: 4.7,
//   price: 452,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('error', err);
//   });

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
