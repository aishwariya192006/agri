import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  type:     {
    type: String,
    enum: ['weather', 'market', 'disease', 'soil', 'scheme', 'reminder', 'system'],
    required: true,
  },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },

  title:    { type: String, required: true },
  message:  { type: String, required: true },
  icon:     { type: String, default: '🔔' },

  /* Deep-link to relevant page */
  actionUrl:   { type: String, default: '' },
  actionLabel: { type: String, default: 'View' },

  /* Reference to source document */
  refModel: { type: String, enum: ['DiseaseAnalysis', 'SoilAnalysis', 'WeatherAlert', 'MarketPrice', 'CropRecommendation', ''], default: '' },
  refId:    { type: mongoose.Schema.Types.ObjectId, default: null },

  isRead:     { type: Boolean, default: false, index: true },
  isDismissed:{ type: Boolean, default: false },

  expiresAt:  { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Notification', notificationSchema);
