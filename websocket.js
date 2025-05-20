const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });
  const clients = new Map();

  wss.on('connection', (ws, req) => {
    const token = req.url.split('token=')[1];
    
    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) return ws.close();

      // Store connection
      clients.set(user.id, ws);
      console.log(`User connected: ${user.username}`);

      // Send message history
      const messages = await Message.find({
        $or: [
          { sender: user.id },
          { receiver: user.id }
        ]
      }).sort('createdAt').populate('sender receiver', 'username role');

      ws.send(JSON.stringify({ type: 'INIT', messages }));

      // Handle messages
      ws.on('message', async (data) => {
        const { type, receiver, content } = JSON.parse(data);
        
        if (type === 'SEND_MESSAGE') {
          const newMessage = new Message({
            sender: user.id,
            receiver,
            content
          });

          await newMessage.save();
          const populatedMsg = await newMessage.populate('sender receiver');

          // Send to receiver
          if (clients.has(receiver)) {
            clients.get(receiver).send(JSON.stringify({
              type: 'NEW_MESSAGE',
              message: populatedMsg
            }));
          }

          // Send back to sender
          ws.send(JSON.stringify({
            type: 'NEW_MESSAGE',
            message: populatedMsg
          }));
        }
      });

      // Handle disconnect
      ws.on('close', () => {
        clients.delete(user.id);
        console.log(`User disconnected: ${user.username}`);
      });
    });
  });
};