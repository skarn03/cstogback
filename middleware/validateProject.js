const { body, validationResult } = require('express-validator');

class Validate {
    static validateProject() {
        return [
            body('title').notEmpty().withMessage('Title is required').isLength({ max: 40 }).withMessage('Title must not be greater than 40 characters'),
            body('description').optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage('Description must not be greater than 500 characters'),
            body('frontendTools.*').optional({ checkFalsy: true }).isString().withMessage('Frontend must be a string or an array of strings'),
            body('backendTools.*').optional({ checkFalsy: true }).isString().withMessage('Backend must be a string or an array of strings'),
            body('OtherTools.*').optional({ checkFalsy: true }).isString().withMessage('OtherTools must be a string or an array of strings'),
            body('projectPicture').optional({ checkFalsy: true }).isString().withMessage('Project picture must be a string'),
            Validate.validateFields
        ];
    }

    static validateFields(req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map((error) => error.msg);
            return res.status(400).json({ message: "Missing Or Invalid Details", errors: errorMessages });
        }

        next();
    }
}

module.exports = Validate;
