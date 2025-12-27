const asyncHandler = require('express-async-handler');
const { constants } = require('../constants');
// returns controller function for any given doc eg. tours, users, reviews
const deleteOne = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      res.status(constants.NOT_FOUND);
      throw new Error('No document found with that ID');
    }
    res.status(204).json({
      status: 'success',
    });
  });

module.exports = { deleteOne };
