const express = require('express');
const { body, param, query } = require('express-validator');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validation');
const {
  createTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo,
  markAsCompleted,
  markAsInProgress,
  cancelTodo,
  getStats
} = require('../controllers/todoController');

const router = express.Router();

// Validare pentru creare todo
const createTodoValidation = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Titlul trebuie să aibă între 1 și 200 de caractere')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descrierea nu poate depăși 1000 de caractere')
    .trim(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Prioritatea trebuie să fie low, medium, high sau urgent'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Data de scadență trebuie să fie în format ISO 8601'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tag-urile trebuie să fie un array'),
  body('tags.*')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Fiecare tag nu poate depăși 20 de caractere')
    .trim(),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic trebuie să fie un boolean')
];

// Validare pentru actualizare todo
const updateTodoValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID-ul todo-ului trebuie să fie un ID MongoDB valid'),
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Titlul trebuie să aibă între 1 și 200 de caractere')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descrierea nu poate depăși 1000 de caractere')
    .trim(),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Status-ul trebuie să fie pending, in_progress, completed sau cancelled'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Prioritatea trebuie să fie low, medium, high sau urgent'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Data de scadență trebuie să fie în format ISO 8601'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tag-urile trebuie să fie un array'),
  body('tags.*')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Fiecare tag nu poate depăși 20 de caractere')
    .trim(),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic trebuie să fie un boolean')
];

// Validare pentru ID-uri
const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID-ul trebuie să fie un ID MongoDB valid')
];

// Validare pentru query parameters
const queryValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Status-ul trebuie să fie pending, in_progress, completed sau cancelled'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Prioritatea trebuie să fie low, medium, high sau urgent'),
  query('dateFilter')
    .optional()
    .isIn(['today', 'week', 'two_weeks', 'month', 'overdue'])
    .withMessage('Filtru de dată invalid'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Pagina trebuie să fie un număr întreg pozitiv'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limita trebuie să fie între 1 și 100'),
  query('sortBy')
    .optional()
    .isIn(['title', 'priority', 'dueDate', 'status', 'createdAt', 'updatedAt'])
    .withMessage('Câmpul de sortare invalid'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordinea de sortare trebuie să fie asc sau desc')
];

// Toate rutele necesită autentificare
router.use(auth);

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Creează un todo nou
 *     description: Creează un nou todo pentru utilizatorul autentificat cu validare completă
 *     tags: [Todo-uri]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TodoCreateRequest'
 *           example:
 *             title: "Cumpără pâine"
 *             description: "Nu uita să cumpăr pâine de la magazin"
 *             priority: "medium"
 *             dueDate: "2023-12-31T23:59:59.000Z"
 *             tags: ["cumpărături", "alimente"]
 *             isPublic: false
 *     responses:
 *       201:
 *         description: Todo creat cu succes
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         todo:
 *                           $ref: '#/components/schemas/Todo'
 *             example:
 *               success: true
 *               message: "Todo creat cu succes"
 *               data:
 *                 todo:
 *                   _id: "507f1f77bcf86cd799439011"
 *                   title: "Cumpără pâine"
 *                   description: "Nu uita să cumpăr pâine de la magazin"
 *                   status: "pending"
 *                   priority: "medium"
 *                   dueDate: "2023-12-31T23:59:59.000Z"
 *                   tags: ["cumpărături", "alimente"]
 *                   isPublic: false
 *                   user: "507f1f77bcf86cd799439012"
 *                   createdAt: "2023-01-01T00:00:00.000Z"
 *                   updatedAt: "2023-01-01T00:00:00.000Z"
 *       400:
 *         description: Date invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Erori de validare
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', createTodoValidation, validate, createTodo);

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Obține toate todo-urile utilizatorului cu filtrare
 *     description: Returnează lista de todo-uri cu filtrare avansată, paginare și sortare
 *     tags: [Todo-uri]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         description: Filtrare după status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filtrare după prioritate
 *       - in: query
 *         name: dateFilter
 *         schema:
 *           type: string
 *           enum: [today, week, two_weeks, month, overdue]
 *         description: Filtrare după dată (azi, săptămâna aceasta, 2 săptămâni, luna aceasta, întârziat)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Căutare în titlu și descriere
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numărul paginii
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Numărul de elemente per pagină
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, priority, dueDate, status, createdAt, updatedAt]
 *           default: createdAt
 *         description: Câmpul de sortare
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordinea de sortare
 *     responses:
 *       200:
 *         description: Lista de todo-uri cu paginare
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         todos:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Todo'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *             example:
 *               success: true
 *               data:
 *                 todos:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     title: "Cumpără pâine"
 *                     description: "Nu uita să cumpăr pâine"
 *                     status: "pending"
 *                     priority: "medium"
 *                     dueDate: "2023-12-31T23:59:59.000Z"
 *                     isOverdue: false
 *                     timeUntilDue: "2 zile"
 *                     progress: 0
 *                     tags: ["cumpărături", "alimente"]
 *                     isPublic: false
 *                     user:
 *                       _id: "507f1f77bcf86cd799439012"
 *                       firstName: "John"
 *                       lastName: "Doe"
 *                       username: "john_doe"
 *                     createdAt: "2023-01-01T00:00:00.000Z"
 *                     updatedAt: "2023-01-01T00:00:00.000Z"
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 1
 *                   totalItems: 1
 *                   itemsPerPage: 10
 *       401:
 *         description: Token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Erori de validare pentru parametrii de query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', queryValidation, validate, getTodos);

/**
 * @swagger
 * /todos/stats:
 *   get:
 *     summary: Obține statistici pentru todo-uri
 *     description: Returnează statistici detaliate despre todo-urile utilizatorului
 *     tags: [Todo-uri]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statisticile todo-urilor
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         stats:
 *                           $ref: '#/components/schemas/TodoStats'
 *             example:
 *               success: true
 *               data:
 *                 stats:
 *                   total: 10
 *                   completed: 5
 *                   pending: 3
 *                   inProgress: 1
 *                   cancelled: 1
 *                   overdue: 2
 *                   completionRate: 50
 *                   priorityBreakdown:
 *                     low: 2
 *                     medium: 4
 *                     high: 3
 *                     urgent: 1
 *       401:
 *         description: Token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', getStats);

/**
 * @swagger
 * /todos/{id}:
 *   get:
 *     summary: Obține un todo specific
 *     tags: [Todo-uri]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ul todo-ului
 *     responses:
 *       200:
 *         description: Todo-ul găsit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Todo nu a fost găsit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', idValidation, validate, getTodo);

/**
 * @swagger
 * /todos/{id}:
 *   put:
 *     summary: Actualizează un todo
 *     tags: [Todo-uri]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ul todo-ului
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: Titlul todo-ului
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Descrierea todo-ului
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *                 description: Statusul todo-ului
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 description: Prioritatea todo-ului
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Data de scadență
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 20
 *                 description: Tag-urile asociate todo-ului
 *               isPublic:
 *                 type: boolean
 *                 description: Dacă todo-ul este public
 *     responses:
 *       200:
 *         description: Todo actualizat cu succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Date invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Todo nu a fost găsit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', updateTodoValidation, validate, updateTodo);

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: Șterge un todo
 *     tags: [Todo-uri]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ul todo-ului
 *     responses:
 *       200:
 *         description: Todo șters cu succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Todo nu a fost găsit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', idValidation, validate, deleteTodo);

/**
 * @swagger
 * /todos/{id}/complete:
 *   patch:
 *     summary: Marchează todo ca completat
 *     tags: [Todo-uri]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ul todo-ului
 *     responses:
 *       200:
 *         description: Todo marcat ca completat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Todo nu a fost găsit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/complete', idValidation, validate, markAsCompleted);

/**
 * @swagger
 * /todos/{id}/progress:
 *   patch:
 *     summary: Marchează todo ca în progres
 *     tags: [Todo-uri]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ul todo-ului
 *     responses:
 *       200:
 *         description: Todo marcat ca în progres
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Todo nu a fost găsit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/progress', idValidation, validate, markAsInProgress);

/**
 * @swagger
 * /todos/{id}/cancel:
 *   patch:
 *     summary: Anulează todo
 *     tags: [Todo-uri]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ul todo-ului
 *     responses:
 *       200:
 *         description: Todo anulat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Todo nu a fost găsit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/cancel', idValidation, validate, cancelTodo);

module.exports = router; 