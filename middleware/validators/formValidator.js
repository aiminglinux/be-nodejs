const { body, validationResult, oneOf } = require('express-validator');

exports.registerValidator = [
  body('name')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Name is required')
    .bail()
    .isLength({ min: 3, max: 20 })
    .withMessage('Name length between 3 and 20 chars')
    .bail(),
  body('email')
    .trim()
    .normalizeEmail({ gmail_remove_dots: false })
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Invalid email address')
    .bail(),
  body('username')
    .toLowerCase()
    .custom((value) => !/\s/.test(value))
    .withMessage('No space allowed in the username')
    .bail(),
  body('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 6 })
    .withMessage('Minimum password length is 6 characters')
    .bail(),
  body('passwordConfirmation')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Confirm password is required field')
    .bail()
    .custom(async (value, { req }) => {
      const password = req.body.password;
      if (value !== password) {
        throw new Error('Confirmation password does not match');
      }
    })
    .bail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

exports.authValidator = [
  oneOf([
    body('email')
      .isEmail()
      .withMessage('Invalid email')
      .bail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body('username').exists().withMessage('Username is required').bail(),
  ]),

  body('password').exists().withMessage('Password is required').bail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

exports.postValidator = [
  body('title').notEmpty().withMessage('Title is required').bail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];
