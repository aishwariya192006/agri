import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role:      { type: String, enum: ['user', 'ai', 'error'], required: true },
  text:      { type: String, required: true },
  chips:     [{ type: String }],
  topic:     { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const chatHistorySchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  /* Session info */
  sessionId:   { type: String, required: true },
  title:       { type: String, default: 'New Conversation' },
  lang:        { type: String, default: 'en' },
  topic:       { type: String, default: 'general' },

  /* Location context at time of chat */
  location: {
    state:    { type: String, default: '' },
    district: { type: String, default: '' },
  },

  messages:   [messageSchema],
  messageCount:{ type: Number, default: 0 },
  isActive:   { type: Boolean, default: true },
  lastMessage:{ type: String, default: '' },
}, { timestamps: true });

chatHistorySchema.index({ user: 1, createdAt: -1 });
chatHistorySchema.index({ user: 1, sessionId: 1 }, { unique: true });

export default mongoose.model('ChatHistory', chatHistorySchema);
