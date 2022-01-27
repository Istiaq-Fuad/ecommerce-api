const Review = require("../models/Review");
const Product = require("../models/Product");

const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../errors/not-found");
const { BadRequestError } = require("../errors");
const checkPermission = require("../utils/checkPermission");

const createReview = async (req, res) => {
  const { product: productId } = req.body;

  const isValidProduct = await Product.findById(productId);
  if (!isValidProduct) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }

  const alreadySubmitted = await Review.findOne({
    _id: productId,
    user: req.user.userId,
  });

  if (alreadySubmitted) {
    throw new BadRequestError("Review already exist");
  }

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: "product",
    select: "name company price",
  });

  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  checkPermission(req.user, review.user);

  review.title = title;
  review.rating = rating;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  checkPermission(req.user, review.user);
  await review.remove();

  res.status(StatusCodes.OK).json({ message: "Success!! review deleted" });
};

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
