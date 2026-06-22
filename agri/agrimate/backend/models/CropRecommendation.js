import mongoose from 'mongoose';

const cropItemSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  variety:     { type: String, default: '' },
  yield:       { type: String, default: '' },
  profit:      { type: String, default: '' },
  roi:         { type: String, default: '' },
  suitability: { type: Number, min: 0, max: 100, default: 80 },
  sowingWindow:{ type: String, default: '' },
  harvestDays: { type: Number, default: 0 },
  waterNeeds:  { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  marketDemand:{ type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
}, { _id: false });

const cropRecommendationSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  /* Context */
  season:   { type: String, enum: ['Kharif', 'Rabi', 'Zaid'], required: true },
  soilType: { type: String, default: 'Loamy' },
  location: {
    state:    { type: String, default: 'Punjab' },
    district: { type: String, default: '' },
    village:  { type: String, default: '' },
  },
  farmArea:  { type: Number, default: 12 },

  /* AI output */
  recommendations: [cropItemSchema],

  /* Metadata */
  aiModel:   { type: String, default: 'AgriMate-CropAI-v1' },
  basedOn:   [{ type: String }],   /* e.g. ['soil_type', 'location', 'market_prices'] */
  notes:     { type: String, default: '' },
  isSaved:   { type: Boolean, default: false },
}, { timestamps: true });

cropRecommendationSchema.index({ user: 1, createdAt: -1 });
cropRecommendationSchema.index({ user: 1, season: 1 });

export default mongoose.model('CropRecommendation', cropRecommendationSchema);
