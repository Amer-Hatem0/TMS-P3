const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const resolvers = {
  Query: {
    me: async (_, __, { token }) => {
      if (!token) return null;

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return await User.findById(decoded.id);
      } catch (err) {
        return null;
      }
    }
  },
Query: {
  dashboardStats: async () => {
    const projects = await ProjectModel.countDocuments();
    const students = await UserModel.countDocuments({ role: "student" });
    const tasks = await TaskModel.countDocuments();
    const finishedProjects = await ProjectModel.countDocuments({ status: "finished" });

    return { projects, students, tasks, finishedProjects };
  },
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
    }
  }
};

module.exports = { resolvers };
