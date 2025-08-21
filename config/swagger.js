const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo List API',
      version: '1.0.0',
      description: 'API complet pentru gestionarea unei aplicații Todo List cu autentificare JWT, gestionare utilizatori și todo-uri cu funcționalități avansate',
      contact: {
        name: 'API Support',
        email: 'support@todolist.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Server de dezvoltare'
      },
      {
        url: 'https://api.todolist.com',
        description: 'Server de producție'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT pentru autentificare. Includeți token-ul în header-ul Authorization: Bearer <token>'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              format: 'ObjectId',
              description: 'ID-ul unic al utilizatorului'
            },
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 30,
              pattern: '^[a-zA-Z0-9_]+$',
              description: 'Username-ul utilizatorului (doar litere, cifre și underscore)'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email-ul utilizatorului'
            },
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Prenumele utilizatorului'
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Numele utilizatorului'
            },
            isActive: {
              type: 'boolean',
              default: true,
              description: 'Statusul contului (activ/inactiv)'
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Ultima conectare a utilizatorului'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data creării contului'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data ultimei actualizări'
            }
          },
          required: ['username', 'email', 'firstName', 'lastName']
        },
        Todo: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              format: 'ObjectId',
              description: 'ID-ul unic al todo-ului'
            },
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              description: 'Titlul todo-ului'
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Descrierea detaliată a todo-ului'
            },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed', 'cancelled'],
              default: 'pending',
              description: 'Statusul curent al todo-ului'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              default: 'medium',
              description: 'Prioritatea todo-ului'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Data de scadență a todo-ului'
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data când todo-ul a fost completat'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
                maxLength: 20
              },
              description: 'Tag-urile asociate todo-ului pentru organizare'
            },
            user: {
              $ref: '#/components/schemas/User',
              description: 'Utilizatorul care a creat todo-ul'
            },
            isPublic: {
              type: 'boolean',
              default: false,
              description: 'Dacă todo-ul este vizibil public'
            },
            isOverdue: {
              type: 'boolean',
              description: 'Dacă todo-ul este întârziat (calculat automat)'
            },
            timeUntilDue: {
              type: 'string',
              description: 'Timpul rămas până la scadență (calculat automat)'
            },
            progress: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Progresul todo-ului în procente (0-100)'
            },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  filename: { type: 'string' },
                  originalName: { type: 'string' },
                  mimeType: { type: 'string' },
                  size: { type: 'number' },
                  url: { type: 'string' }
                }
              },
              description: 'Fișiere atașate la todo'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data creării todo-ului'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data ultimei actualizări'
            }
          },
          required: ['title', 'user']
        },
        TodoStats: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Numărul total de todo-uri'
            },
            completed: {
              type: 'integer',
              description: 'Numărul de todo-uri completate'
            },
            pending: {
              type: 'integer',
              description: 'Numărul de todo-uri în așteptare'
            },
            inProgress: {
              type: 'integer',
              description: 'Numărul de todo-uri în progres'
            },
            cancelled: {
              type: 'integer',
              description: 'Numărul de todo-uri anulate'
            },
            overdue: {
              type: 'integer',
              description: 'Numărul de todo-uri întârziate'
            },
            completionRate: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Rata de completare în procente'
            },
            priorityBreakdown: {
              type: 'object',
              properties: {
                low: { type: 'integer' },
                medium: { type: 'integer' },
                high: { type: 'integer' },
                urgent: { type: 'integer' }
              },
              description: 'Distribuția todo-urilor pe priorități'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
              minimum: 1,
              description: 'Pagina curentă'
            },
            totalPages: {
              type: 'integer',
              minimum: 0,
              description: 'Numărul total de pagini'
            },
            totalItems: {
              type: 'integer',
              minimum: 0,
              description: 'Numărul total de elemente'
            },
            itemsPerPage: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              description: 'Numărul de elemente per pagină'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Mesajul de eroare principal'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Câmpul care a cauzat eroarea'
                  },
                  message: {
                    type: 'string',
                    description: 'Mesajul de eroare pentru câmp'
                  },
                  value: {
                    type: 'string',
                    description: 'Valoarea care a cauzat eroarea'
                  }
                }
              },
              description: 'Lista de erori de validare'
            }
          },
          required: ['success', 'message']
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Mesajul de succes'
            },
            data: {
              type: 'object',
              description: 'Datele returnate de API'
            }
          },
          required: ['success']
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email-ul utilizatorului'
            },
            password: {
              type: 'string',
              description: 'Parola utilizatorului'
            }
          },
          required: ['email', 'password']
        },
        RegisterRequest: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 30,
              pattern: '^[a-zA-Z0-9_]+$',
              description: 'Username-ul utilizatorului'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email-ul utilizatorului'
            },
            password: {
              type: 'string',
              minLength: 6,
              pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
              description: 'Parola (min 6 caractere, cel puțin o literă mică, mare și o cifră)'
            },
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Prenumele utilizatorului'
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Numele utilizatorului'
            }
          },
          required: ['username', 'email', 'password', 'firstName', 'lastName']
        },
        TodoCreateRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              description: 'Titlul todo-ului'
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Descrierea todo-ului'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              default: 'medium',
              description: 'Prioritatea todo-ului'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Data de scadență'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
                maxLength: 20
              },
              description: 'Tag-urile asociate todo-ului'
            },
            isPublic: {
              type: 'boolean',
              default: false,
              description: 'Dacă todo-ul este public'
            }
          },
          required: ['title']
        },
        TodoUpdateRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              description: 'Titlul todo-ului'
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Descrierea todo-ului'
            },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed', 'cancelled'],
              description: 'Statusul todo-ului'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Prioritatea todo-ului'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Data de scadență'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
                maxLength: 20
              },
              description: 'Tag-urile asociate todo-ului'
            },
            isPublic: {
              type: 'boolean',
              description: 'Dacă todo-ul este public'
            }
          }
        },
        ProfileUpdateRequest: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Prenumele utilizatorului'
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Numele utilizatorului'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email-ul utilizatorului'
            }
          }
        },
        ChangePasswordRequest: {
          type: 'object',
          properties: {
            currentPassword: {
              type: 'string',
              description: 'Parola curentă'
            },
            newPassword: {
              type: 'string',
              minLength: 6,
              pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
              description: 'Parola nouă (min 6 caractere, cel puțin o literă mică, mare și o cifră)'
            }
          },
          required: ['currentPassword', 'newPassword']
        },
        RefreshTokenRequest: {
          type: 'object',
          properties: {
            refreshToken: {
              type: 'string',
              description: 'Refresh token-ul pentru obținerea unui nou access token'
            }
          },
          required: ['refreshToken']
        }
      }
    },
    tags: [
      {
        name: 'Autentificare',
        description: 'Endpoints pentru înregistrare, autentificare și gestionarea token-urilor'
      },
      {
        name: 'Profil',
        description: 'Endpoints pentru gestionarea profilului utilizatorului'
      },
      {
        name: 'Todo-uri',
        description: 'Endpoints pentru gestionarea todo-urilor (CRUD, filtrare, statistici)'
      },
      {
        name: 'Sistem',
        description: 'Endpoints pentru informații despre sistem și health check'
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js', './server.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs; 