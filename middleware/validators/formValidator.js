const { body, validationResult, oneOf } = require('express-validator');

exports.registerValidator = [
  body('name')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Name is required')
    .bail()
    .isLength({ min: 3 })
    .withMessage('Minimum 3 characters required')
    .bail(),
  body('email')
    .trim()
    .normalizeEmail()
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Please input a valid email')
    .bail(),
  body('username')
    .custom((value) => !/\s/.test(value))
    .withMessage('No space allowed in the username')
    .bail(),
  body('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Minimum password lenght is 6 characters')
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
      .withMessage('Please input a valid email')
      .bail()
      .normalizeEmail(),
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
