const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Category = require('../models/Category');

const resolvers = {

  Query: {
    me: async (_, __, { token }) => {
      if (!token) return null;

      try {
        //const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        return await User.findById(user.id);
      } catch (err) {
        return null;
      }
    },
    getAllCategories: async () => {
      return await Category.find().sort({ name: 1 });
    },
    dashboardStats: async () => {
      const projects = await ProjectModel.countDocuments();
      const students = await UserModel.countDocuments({ role: "student" });
      const tasks = await TaskModel.countDocuments();
      const finishedProjects = await ProjectModel.countDocuments({ status: "finished" });
  
      return { projects, students, tasks, finishedProjects };
    },
    getProjects: async (_, __, { user }) => {
      if (!user || user.role !== 'admin') throw new ForbiddenError('Admin access only');
      return await Project.find().populate('createdBy members');
    },
    getProject: async (_, { id }, { user }) => {
      if (!user || user.role !== 'admin') throw new ForbiddenError('Admin access only');
      return await Project.findById(id).populate('createdBy members');
    },
    getMyProjects: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Unauthenticated');
      return await Project.find({ members: user.id }).populate('createdBy');
    },
    getProjectOptions: async (_, __, { user }) => {
      if (!user || user.role !== 'admin') throw new ForbiddenError('Admin only');
      return await Project.find({}, 'id title');  // Only fetch ID and title
    },
    
    // For student dropdown (ID + username)
    getStudentOptions: async (_, __, { user }) => {
      if (!user || user.role !== 'admin') throw new ForbiddenError('Admin only');
      return await User.find({ role: 'student' }, 'id username');
    },
    Task: {
      projectTitle: async (parent) => {
        const project = await Project.findById(parent.project);
        return project?.title || '';
      }
    }
  },

  Mutation: {
    signUp: async (_, { username, password, role, universityId }) => {
      if (role === 'student' && !universityId) {
        throw new Error('University ID is required for students.');
      }

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new Error('Username already exists.');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        username,
        password: hashedPassword,
        role,
        universityId
      });

      const token = jwt.sign(
        {
          id: newUser._id,
          username: newUser.username,
          role: newUser.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const redirectUrl = newUser.role === 'admin'
        ? `/admin/${newUser._id}`
        : `/student/${newUser._id}`;

      return { token, user: newUser, redirectUrl };
    },

    login: async (_, { username, password }) => {
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error('User not found.');
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error('Invalid password.');
      }

      const token = jwt.sign(
        {
          id: user._id,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const redirectUrl = user.role === 'admin'
        ? `/admin/${user._id}`
        : `/student/${user._id}`;

      return { token, user, redirectUrl };
    },

    createCategory: async (_, { name }, { user }) => {
      if (!user || user.role !== 'admin') throw new ForbiddenError('Admin only');
      
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        throw new Error('Category already exists');
      }

      return await Category.create({ name });
    },

    // Projects
    createProject: async (_, { 
      title, 
      description, 
      category,
      status,
      startDate, 
      endDate, 
      memberUsernames 
    }, { user }) => {
      // 1. Admin check
  if (!user || user.role !== 'admin') throw new ForbiddenError('Admin access only');

  // 2. Handle category (create if doesn't exist)
  const category = await Category.findOneAndUpdate(
    { name: { $regex: new RegExp(`^${categoryName}$`, 'i') } },
    { $setOnInsert: { name: categoryName } },
    { upsert: true, new: true }
  );

  // 3. Convert member usernames to IDs
  const members = await User.find({
    username: { $in: memberUsernames },
    role: 'student'
  });

  if (members.length !== memberUsernames.length) {
    throw new Error('One or more student usernames not found');
  }
  const memberIds = members.map(m => m._id);

      const project = new Project({
        title,
        description,
        category: category._id,
        status: status || 'PENDING',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: user.id,
        members: memberIds
      });

      await project.save();
      return project.populate('members category');
    },

    updateProjectProgress: async (_, { projectId, progress }, { user }) => {
      if (!user) throw new AuthenticationError('Unauthenticated');
      
      // Verify student is a project member
      const project = await Project.findOne({
        _id: projectId,
        members: user.id
      });
      if (!project) throw new ForbiddenError('Not a project member');

      // Update logic (example - you might want to add a progress field to the model)
      project.progress = Math.min(100, Math.max(0, progress));
      await project.save();
      return project;
    },


    createTask: async (_, { 
      title, 
      description, 
      projectTitle, 
      assignedToUsername, 
      status, 
      dueDate 
    }, { user }) => {
      // 1. Admin check
  if (!user || user.role !== 'admin') throw new ForbiddenError('Admin only');

  // 2. Find project by title
  const project = await Project.findOne({ title: projectTitle });
  if (!project) throw new Error('Project not found');

  // 3. Find student by username
  const student = await User.findOne({ 
    username: assignedToUsername,
    role: 'student'
  });
  if (!student) throw new Error('Student not found');

  // 4. Verify student is in project
  if (!project.members.includes(student._id)) {
    throw new Error('This student is not assigned to the project');
  }

  // 5. Create task
      const task = new Task({
        title,
        description,
        project: project._id,
        assignedTo: student._id,
        status: status || 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : null
      });

      await task.save();
      return task.populate('assignedTo project');
    }

  }
};

module.exports = { resolvers };
