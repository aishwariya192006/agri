import mongoose from 'mongoose';

const weatherAlertSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  type:     { type: String, enum: ['rain', 'drought', 'frost', 'heatwave', 'storm', 'fog', 'general'], default: 'rain' },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },

  title:    { type: String, required: true },
  message:  { type: String, required: true },

  /* Forecast data */
  forecast: {
    day:         { type: String, default: '' },
    date:        { type: String, default: '' },
    rainPct:     { type: Number, default: 0 },
    tempHi:      { type: Number, default: 0 },
    tempLo:      { type: Number, default: 0 },
    precipitation:{ type: Number, default: 0 },
    icon:        { type: String, default: 'cloud' },
  },

  /* Irrigation recommendation */
  irrigationAction: {
    type: String,
    enum: ['skip', 'reduce', 'normal', 'increase'],
    default: 'normal',
  },
  irrigationNote: { type: String, default: '' },

  /* Location */
  location: {
    state:    { type: String, default: '' },
    district: { type: String, default: '' },
    lat:      { type: Number, default: 0 },
    lon:      { type: Number, default: 0 },
  },

  validFrom:  { type: Date, default: Date.now },
  validUntil: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },

  isRead:     { type: Boolean, default: false },
  isDismissed:{ type: Boolean, default: false },
}, { timestamps: true });

weatherAlertSchema.index({ user: 1, createdAt: -1 });
weatherAlertSchema.index({ user: 1, isRead: 1 });
weatherAlertSchema.index({ validUntil: 1 }, { expireAfterSeconds: 0 }); /* Auto-delete expired */

export default mongoose.model('WeatherAlert', weatherAlertSchema);
