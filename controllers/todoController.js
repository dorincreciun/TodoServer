const Todo = require('../models/Todo');

// Creează un todo nou
const createTodo = async (req, res) => {
  try {
    const { title, description, priority, dueDate, tags, isPublic } = req.body;

    const todo = new Todo({
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: tags || [],
      isPublic: isPublic || false,
      user: req.user._id
    });

    await todo.save();

    res.status(201).json({
      success: true,
      message: 'Todo creat cu succes',
      data: {
        todo
      }
    });
  } catch (error) {
    console.error('Eroare creare todo:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la crearea todo-ului'
    });
  }
};

// Obține toate todo-urile utilizatorului cu filtrare
const getTodos = async (req, res) => {
  try {
    const {
      status,
      priority,
      dateFilter,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { user: req.user._id };

    // Filtrare după status
    if (status) {
      filter.status = status;
    }

    // Filtrare după prioritate
    if (priority) {
      filter.priority = priority;
    }

    // Filtrare după dată
    if (dateFilter) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (dateFilter) {
        case 'today':
          filter.dueDate = {
            $gte: startOfDay,
            $lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
          };
          break;
        case 'week':
          const endOfWeek = new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000);
          filter.dueDate = {
            $gte: startOfDay,
            $lt: endOfWeek
          };
          break;
        case 'two_weeks':
          const endOfTwoWeeks = new Date(startOfDay.getTime() + 14 * 24 * 60 * 60 * 1000);
          filter.dueDate = {
            $gte: startOfDay,
            $lt: endOfTwoWeeks
          };
          break;
        case 'month':
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          filter.dueDate = {
            $gte: startOfDay,
            $lte: endOfMonth
          };
          break;
        case 'overdue':
          filter.dueDate = { $lt: startOfDay };
          filter.status = { $nin: ['completed', 'cancelled'] };
          break;
      }
    }

    // Căutare în titlu și descriere
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sortare
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Paginare
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const todos = await Todo.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'firstName lastName username');

    const total = await Todo.countDocuments(filter);

    // Adaugă informații suplimentare pentru fiecare todo
    const todosWithInfo = todos.map(todo => {
      const todoObj = todo.toObject();
      todoObj.isOverdue = todo.isOverdue();
      todoObj.timeUntilDue = todo.getTimeUntilDue();
      todoObj.progress = todo.getProgress();
      return todoObj;
    });

    res.json({
      success: true,
      data: {
        todos: todosWithInfo,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Eroare obținere todo-uri:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea todo-urilor'
    });
  }
};

// Obține un todo specific
const getTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('user', 'firstName lastName username');

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo nu a fost găsit'
      });
    }

    const todoObj = todo.toObject();
    todoObj.isOverdue = todo.isOverdue();
    todoObj.timeUntilDue = todo.getTimeUntilDue();
    todoObj.progress = todo.getProgress();

    res.json({
      success: true,
      data: {
        todo: todoObj
      }
    });
  } catch (error) {
    console.error('Eroare obținere todo:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea todo-ului'
    });
  }
};

// Actualizează un todo
const updateTodo = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags, isPublic } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined) updateData.tags = tags;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    // Dacă status-ul este completat, setează completedAt
    if (status === 'completed') {
      updateData.completedAt = new Date();
    } else if (status !== 'completed') {
      updateData.completedAt = null;
    }

    const todo = await Todo.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id
      },
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName username');

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo nu a fost găsit'
      });
    }

    const todoObj = todo.toObject();
    todoObj.isOverdue = todo.isOverdue();
    todoObj.timeUntilDue = todo.getTimeUntilDue();
    todoObj.progress = todo.getProgress();

    res.json({
      success: true,
      message: 'Todo actualizat cu succes',
      data: {
        todo: todoObj
      }
    });
  } catch (error) {
    console.error('Eroare actualizare todo:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea todo-ului'
    });
  }
};

// Șterge un todo
const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo nu a fost găsit'
      });
    }

    res.json({
      success: true,
      message: 'Todo șters cu succes'
    });
  } catch (error) {
    console.error('Eroare ștergere todo:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea todo-ului'
    });
  }
};

// Marchează todo ca completat
const markAsCompleted = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo nu a fost găsit'
      });
    }

    await todo.markAsCompleted();

    res.json({
      success: true,
      message: 'Todo marcat ca completat',
      data: {
        todo
      }
    });
  } catch (error) {
    console.error('Eroare marcare completat:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la marcarea todo-ului ca completat'
    });
  }
};

// Marchează todo ca în progres
const markAsInProgress = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo nu a fost găsit'
      });
    }

    await todo.markAsInProgress();

    res.json({
      success: true,
      message: 'Todo marcat ca în progres',
      data: {
        todo
      }
    });
  } catch (error) {
    console.error('Eroare marcare în progres:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la marcarea todo-ului ca în progres'
    });
  }
};

// Anulează todo
const cancelTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo nu a fost găsit'
      });
    }

    await todo.cancel();

    res.json({
      success: true,
      message: 'Todo anulat',
      data: {
        todo
      }
    });
  } catch (error) {
    console.error('Eroare anulare todo:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la anularea todo-ului'
    });
  }
};

// Obține statistici pentru todo-uri
const getStats = async (req, res) => {
  try {
    const stats = await Todo.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'completed'] },
                    { $ne: ['$status', 'cancelled'] },
                    { $lt: ['$dueDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const priorityStats = await Todo.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: stats[0]?.total || 0,
      completed: stats[0]?.completed || 0,
      pending: stats[0]?.pending || 0,
      inProgress: stats[0]?.inProgress || 0,
      cancelled: stats[0]?.cancelled || 0,
      overdue: stats[0]?.overdue || 0,
      completionRate: stats[0]?.total ? Math.round((stats[0].completed / stats[0].total) * 100) : 0,
      priorityBreakdown: priorityStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: {
        stats: result
      }
    });
  } catch (error) {
    console.error('Eroare obținere statistici:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea statisticilor'
    });
  }
};

module.exports = {
  createTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo,
  markAsCompleted,
  markAsInProgress,
  cancelTodo,
  getStats
}; 