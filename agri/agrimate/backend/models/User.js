import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  type:       { type: String, enum: ['disease', 'soil'], required: true },
  result:     { type: mongoose.Schema.Types.Mixed, required: true },
  imageUrl:   { type: String, default: '' },
  createdAt:  { type: Date, default: Date.now },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  phone:        { type: String, default: '' },
  passwordHash: { type: String, required: true },

  /* Location (Feature 6) */
  location: {
    state:    { type: String, default: 'Punjab' },
    district: { type: String, default: 'Ludhiana' },
    village:  { type: String, default: '' },
  },

  farm: {
    state:   { type: String, default: 'Punjab' },
    area:    { type: Number, default: 12 },
    crops:   { type: [String], default: ['Wheat', 'Cotton'] },
    soilType:{ type: String, default: 'Loamy' },
  },

  /* Analysis history (Feature 1) */
  analysisHistory: { type: [analysisSchema], default: [] },

  /* Notification preferences */
  notifications: {
    weatherAlerts:  { type: Boolean, default: true },
    marketAlerts:   { type: Boolean, default: true },
    diseaseAlerts:  { type: Boolean, default: true },
    rainThreshold:  { type: Number, default: 60 },
  },

  /* Language preference (Feature 2) */
  preferredLang: { type: String, default: 'en' },

}, { timestamps: true });

export default mongoose.model('User', userSchema);
