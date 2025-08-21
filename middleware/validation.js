const Joi = require('joi');
const { logError } = require('../config/logger');

// Schema-uri de validare
const schemas = {
  // Validare pentru înregistrare utilizator
  register: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': 'Username-ul trebuie să conțină doar litere și cifre',
        'string.min': 'Username-ul trebuie să aibă cel puțin 3 caractere',
        'string.max': 'Username-ul nu poate depăși 30 de caractere',
        'any.required': 'Username-ul este obligatoriu',
      }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'Vă rugăm introduceți un email valid',
        'any.required': 'Email-ul este obligatoriu',
      }),
    password: Joi.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .min(8)
      .max(128)
      .required()
      .messages({
        'string.pattern.base': 'Parola trebuie să conțină cel puțin o literă mică, o literă mare, o cifră și un caracter special',
        'string.min': 'Parola trebuie să aibă cel puțin 8 caractere',
        'string.max': 'Parola nu poate depăși 128 de caractere',
        'any.required': 'Parola este obligatorie',
      }),
    firstName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-ZăâîșțĂÂÎȘȚ\s]+$/)
      .required()
      .messages({
        'string.min': 'Prenumele trebuie să aibă cel puțin 2 caractere',
        'string.max': 'Prenumele nu poate depăși 50 de caractere',
        'string.pattern.base': 'Prenumele poate conține doar litere și spații',
        'any.required': 'Prenumele este obligatoriu',
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-ZăâîșțĂÂÎȘȚ\s]+$/)
      .required()
      .messages({
        'string.min': 'Numele trebuie să aibă cel puțin 2 caractere',
        'string.max': 'Numele nu poate depăși 50 de caractere',
        'string.pattern.base': 'Numele poate conține doar litere și spații',
        'any.required': 'Numele este obligatoriu',
      }),
  }),

  // Validare pentru autentificare
  login: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'Vă rugăm introduceți un email valid',
        'any.required': 'Email-ul este obligatoriu',
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Parola este obligatorie',
      }),
  }),

  // Validare pentru refresh token
  refreshToken: Joi.object({
    refreshToken: Joi.string()
      .required()
      .messages({
        'any.required': 'Refresh token-ul este obligatoriu',
      }),
  }),

  // Validare pentru creare todo
  createTodo: Joi.object({
    title: Joi.string()
      .trim()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': 'Titlul nu poate fi gol',
        'string.max': 'Titlul nu poate depăși 200 de caractere',
        'any.required': 'Titlul este obligatoriu',
      }),
    description: Joi.string()
      .trim()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Descrierea nu poate depăși 1000 de caractere',
      }),
    status: Joi.string()
      .valid('pending', 'in_progress', 'completed', 'cancelled')
      .default('pending')
      .messages({
        'any.only': 'Status-ul trebuie să fie pending, in_progress, completed sau cancelled',
      }),
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'urgent')
      .default('medium')
      .messages({
        'any.only': 'Prioritatea trebuie să fie low, medium, high sau urgent',
      }),
    dueDate: Joi.date()
      .iso()
      .min('now')
      .optional()
      .messages({
        'date.base': 'Data de scadență trebuie să fie o dată validă',
        'date.min': 'Data de scadență nu poate fi în trecut',
      }),
    tags: Joi.array()
      .items(
        Joi.string()
          .trim()
          .min(1)
          .max(20)
          .pattern(/^[a-zA-Z0-9\s\-_]+$/)
      )
      .max(10)
      .optional()
      .messages({
        'array.max': 'Nu pot fi adăugate mai mult de 10 tag-uri',
        'string.pattern.base': 'Tag-urile pot conține doar litere, cifre, spații, cratime și underscore',
      }),
    isPublic: Joi.boolean()
      .default(false)
      .messages({
        'boolean.base': 'isPublic trebuie să fie true sau false',
      }),
  }),

  // Validare pentru actualizare todo
  updateTodo: Joi.object({
    title: Joi.string()
      .trim()
      .min(1)
      .max(200)
      .optional()
      .messages({
        'string.min': 'Titlul nu poate fi gol',
        'string.max': 'Titlul nu poate depăși 200 de caractere',
      }),
    description: Joi.string()
      .trim()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Descrierea nu poate depăși 1000 de caractere',
      }),
    status: Joi.string()
      .valid('pending', 'in_progress', 'completed', 'cancelled')
      .optional()
      .messages({
        'any.only': 'Status-ul trebuie să fie pending, in_progress, completed sau cancelled',
      }),
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'urgent')
      .optional()
      .messages({
        'any.only': 'Prioritatea trebuie să fie low, medium, high sau urgent',
      }),
    dueDate: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.base': 'Data de scadență trebuie să fie o dată validă',
      }),
    tags: Joi.array()
      .items(
        Joi.string()
          .trim()
          .min(1)
          .max(20)
          .pattern(/^[a-zA-Z0-9\s\-_]+$/)
      )
      .max(10)
      .optional()
      .messages({
        'array.max': 'Nu pot fi adăugate mai mult de 10 tag-uri',
        'string.pattern.base': 'Tag-urile pot conține doar litere, cifre, spații, cratime și underscore',
      }),
    isPublic: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'isPublic trebuie să fie true sau false',
      }),
  }),

  // Validare pentru query parameters
  todoQuery: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Pagina trebuie să fie un număr',
        'number.integer': 'Pagina trebuie să fie un număr întreg',
        'number.min': 'Pagina trebuie să fie cel puțin 1',
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.base': 'Limita trebuie să fie un număr',
        'number.integer': 'Limita trebuie să fie un număr întreg',
        'number.min': 'Limita trebuie să fie cel puțin 1',
        'number.max': 'Limita nu poate depăși 100',
      }),
    status: Joi.string()
      .valid('pending', 'in_progress', 'completed', 'cancelled')
      .optional()
      .messages({
        'any.only': 'Status-ul trebuie să fie pending, in_progress, completed sau cancelled',
      }),
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'urgent')
      .optional()
      .messages({
        'any.only': 'Prioritatea trebuie să fie low, medium, high sau urgent',
      }),
    search: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Termenul de căutare nu poate fi gol',
        'string.max': 'Termenul de căutare nu poate depăși 100 de caractere',
      }),
    sortBy: Joi.string()
      .valid('createdAt', 'updatedAt', 'dueDate', 'priority', 'status', 'title')
      .default('createdAt')
      .messages({
        'any.only': 'Sortarea trebuie să fie după createdAt, updatedAt, dueDate, priority, status sau title',
      }),
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .messages({
        'any.only': 'Ordinea de sortare trebuie să fie asc sau desc',
      }),
    tags: Joi.string()
      .optional()
      .messages({
        'string.base': 'Tag-urile trebuie să fie o string',
      }),
  }),

  // Validare pentru ID-uri MongoDB
  objectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'ID-ul trebuie să fie un ObjectId valid MongoDB',
      'any.required': 'ID-ul este obligatoriu',
    }),

  // Validare pentru paginare
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Pagina trebuie să fie un număr',
        'number.integer': 'Pagina trebuie să fie un număr întreg',
        'number.min': 'Pagina trebuie să fie cel puțin 1',
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.base': 'Limita trebuie să fie un număr',
        'number.integer': 'Limita trebuie să fie un număr întreg',
        'number.min': 'Limita trebuie să fie cel puțin 1',
        'number.max': 'Limita nu poate depăși 100',
      }),
  }),
};

// Middleware pentru validare
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({
        success: false,
        message: 'Schema de validare invalidă',
      });
    }

    const dataToValidate = {
      ...req.body,
      ...req.query,
      ...req.params,
    };

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      logError(new Error('Validation Error'), {
        context: 'Validation',
        schema: schemaName,
        errors,
        data: dataToValidate,
      });

      return res.status(400).json({
        success: false,
        message: 'Eroare de validare',
        errors,
      });
    }

    // Actualizează request-ul cu datele validate
    req.validatedData = value;
    next();
  };
};

// Funcție pentru validare custom
const validateCustom = (schema) => {
  return (req, res, next) => {
    const dataToValidate = {
      ...req.body,
      ...req.query,
      ...req.params,
    };

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      return res.status(400).json({
        success: false,
        message: 'Eroare de validare',
        errors,
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = {
  schemas,
  validate,
  validateCustom,
}; 