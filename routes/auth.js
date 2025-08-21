const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validation');
const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken
} = require('../controllers/authController');

const router = express.Router();

// Validare pentru înregistrare
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username-ul trebuie să aibă între 3 și 30 de caractere')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username-ul poate conține doar litere, cifre și underscore'),
  body('email')
    .isEmail()
    .withMessage('Vă rugăm introduceți un email valid')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Parola trebuie să aibă cel puțin 6 caractere')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Parola trebuie să conțină cel puțin o literă mică, o literă mare și o cifră'),
  body('firstName')
    .isLength({ min: 2, max: 50 })
    .withMessage('Prenumele trebuie să aibă între 2 și 50 de caractere')
    .trim(),
  body('lastName')
    .isLength({ min: 2, max: 50 })
    .withMessage('Numele trebuie să aibă între 2 și 50 de caractere')
    .trim()
];

// Validare pentru login
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Vă rugăm introduceți un email valid')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Parola este obligatorie')
];

// Validare pentru actualizare profil
const updateProfileValidation = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Prenumele trebuie să aibă între 2 și 50 de caractere')
    .trim(),
  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Numele trebuie să aibă între 2 și 50 de caractere')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Vă rugăm introduceți un email valid')
    .normalizeEmail()
];

// Validare pentru schimbare parolă
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Parola curentă este obligatorie'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Parola nouă trebuie să aibă cel puțin 6 caractere')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Parola nouă trebuie să conțină cel puțin o literă mică, o literă mare și o cifră')
];

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Înregistrare utilizator nou
 *     description: Creează un cont nou pentru utilizator cu validare completă a datelor
 *     tags: [Autentificare]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             username: "john_doe"
 *             email: "john@example.com"
 *             password: "Password123"
 *             firstName: "John"
 *             lastName: "Doe"
 *     responses:
 *       201:
 *         description: Utilizator înregistrat cu succes
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
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         accessToken:
 *                           type: string
 *                           description: JWT access token
 *                         refreshToken:
 *                           type: string
 *                           description: JWT refresh token
 *             example:
 *               success: true
 *               message: "Utilizator înregistrat cu succes"
 *               data:
 *                 user:
 *                   _id: "507f1f77bcf86cd799439011"
 *                   username: "john_doe"
 *                   email: "john@example.com"
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   isActive: true
 *                   createdAt: "2023-01-01T00:00:00.000Z"
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Date invalide sau utilizator existent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Utilizator cu acest email sau username există deja"
 *       422:
 *         description: Erori de validare
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Eroare de validare"
 *               errors:
 *                 - field: "email"
 *                   message: "Vă rugăm introduceți un email valid"
 *                   value: "invalid-email"
 */
router.post('/register', registerValidation, validate, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentificare utilizator
 *     description: Autentifică un utilizator existent și returnează token-uri JWT
 *     tags: [Autentificare]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "john@example.com"
 *             password: "Password123"
 *     responses:
 *       200:
 *         description: Autentificare reușită
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
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         accessToken:
 *                           type: string
 *                           description: JWT access token
 *                         refreshToken:
 *                           type: string
 *                           description: JWT refresh token
 *             example:
 *               success: true
 *               message: "Autentificare reușită"
 *               data:
 *                 user:
 *                   _id: "507f1f77bcf86cd799439011"
 *                   username: "john_doe"
 *                   email: "john@example.com"
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   isActive: true
 *                   lastLogin: "2023-01-01T00:00:00.000Z"
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Credențiale invalide sau cont dezactivat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Email sau parolă incorectă"
 *       422:
 *         description: Erori de validare
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', loginValidation, validate, login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Reîmprospătează token-ul de acces
 *     description: Obține un nou access token folosind un refresh token valid
 *     tags: [Autentificare]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token reîmprospătat cu succes
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
 *                         accessToken:
 *                           type: string
 *                           description: JWT access token nou
 *             example:
 *               success: true
 *               message: "Token reîmprospătat cu succes"
 *               data:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Refresh token lipsă
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Refresh token este obligatoriu"
 *       401:
 *         description: Refresh token invalid sau expirat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Refresh token invalid"
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Deconectare utilizator
 *     description: Deconectează utilizatorul curent (invalidează token-ul pe client)
 *     tags: [Autentificare]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deconectare reușită
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Logout realizat cu succes"
 *       401:
 *         description: Token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Token invalid"
 */
router.post('/logout', auth, logout);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Obține profilul utilizatorului curent
 *     description: Returnează informațiile complete ale profilului utilizatorului autentificat
 *     tags: [Profil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profilul utilizatorului
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
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   _id: "507f1f77bcf86cd799439011"
 *                   username: "john_doe"
 *                   email: "john@example.com"
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   isActive: true
 *                   lastLogin: "2023-01-01T00:00:00.000Z"
 *                   createdAt: "2023-01-01T00:00:00.000Z"
 *                   updatedAt: "2023-01-01T00:00:00.000Z"
 *       401:
 *         description: Token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Token invalid"
 */
router.get('/profile', auth, getProfile);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Actualizează profilul utilizatorului
 *     description: Actualizează informațiile de profil ale utilizatorului autentificat
 *     tags: [Profil]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileUpdateRequest'
 *           example:
 *             firstName: "John"
 *             lastName: "Smith"
 *             email: "john.smith@example.com"
 *     responses:
 *       200:
 *         description: Profil actualizat cu succes
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
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "Profil actualizat cu succes"
 *               data:
 *                 user:
 *                   _id: "507f1f77bcf86cd799439011"
 *                   username: "john_doe"
 *                   email: "john.smith@example.com"
 *                   firstName: "John"
 *                   lastName: "Smith"
 *                   isActive: true
 *                   lastLogin: "2023-01-01T00:00:00.000Z"
 *                   createdAt: "2023-01-01T00:00:00.000Z"
 *                   updatedAt: "2023-01-01T00:00:00.000Z"
 *       400:
 *         description: Date invalide sau email deja folosit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Email-ul este deja folosit de alt utilizator"
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
router.put('/profile', auth, updateProfileValidation, validate, updateProfile);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Schimbă parola utilizatorului
 *     description: Schimbă parola utilizatorului autentificat cu validare a parolei curente
 *     tags: [Profil]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *           example:
 *             currentPassword: "OldPassword123"
 *             newPassword: "NewPassword123"
 *     responses:
 *       200:
 *         description: Parolă schimbată cu succes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Parola schimbată cu succes"
 *       400:
 *         description: Parolă curentă incorectă sau parolă nouă invalidă
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Parola curentă este incorectă"
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
router.put('/change-password', auth, changePasswordValidation, validate, changePassword);

module.exports = router; 