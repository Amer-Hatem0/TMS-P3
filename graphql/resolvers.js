const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const Project = require('../models/Project');

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

    // Projects
    createProject: async (_, { title, description, startDate, endDate, memberIds }, { user }) => {
      // Admin check
      if (!user || user.role !== 'admin') throw new ForbiddenError('Admin access only');

      // Validate all members are students
      const studentCount = await User.countDocuments({
        _id: { $in: memberIds },
        role: 'student'
      });
      if (studentCount !== memberIds.length) throw new Error('Invalid student IDs');

      const project = new Project({
        title,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: user.id,
        members: memberIds
      });

      await project.save();
      return project.populate('members');
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


    createTask: async (_, { title, description, projectId, assignedTo, dueDate }, { user }) => {
      if (!user || user.role !== 'admin') throw new ForbiddenError('Admin only');
      
      // Validate project exists
      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');
      
      // Validate student exists
      const student = await User.findOne({ 
        _id: assignedTo, 
        role: 'student' 
      });
      if (!student) throw new Error('Invalid student ID');
      
      const task = new Task({
        title,
        description,
        project: projectId,
        assignedTo,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'PENDING'  // Default status
      });
      
      await task.save();
      return task.populate('assignedTo project');
    }

  }
};

module.exports = { resolvers };
