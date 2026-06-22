import mongoose from 'mongoose';

const nutrientSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  value:  { type: Number, required: true },
  status: { type: String, enum: ['Very Low', 'Low', 'Medium', 'Good', 'Excess'], default: 'Medium' },
  color:  { type: String, default: '#4ADE80' },
  msg:    { type: String, default: '' },
}, { _id: false });

const soilAnalysisSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  /* CNN model metadata */
  model:        { type: String, default: 'CNN-AgriMate-v1' },
  architecture: { type: String, default: 'ResNet-50' },
  analysisType: { type: String, default: 'Convolutional Neural Network' },

  /* Image */
  imageUrl:     { type: String, default: '' },

  /* Soil metrics */
  healthScore:    { type: Number, min: 0, max: 100, default: 0 },
  nitrogen:       { type: Number, min: 0, max: 100, default: 0 },
  phosphorus:     { type: Number, min: 0, max: 100, default: 0 },
  potassium:      { type: Number, min: 0, max: 100, default: 0 },
  pH:             { type: Number, min: 0, max: 14, default: 7 },
  organicMatter:  { type: Number, default: 0 },
  texture:        { type: String, default: 'Loamy' },
  classification: { type: String, default: 'Moderately Fertile' },

  nutrients:        [nutrientSchema],
  suitableCrops:    [{ type: String }],
  recommendations:  [{ type: String }],

  /* Location context */
  location: {
    state:    { type: String, default: '' },
    district: { type: String, default: '' },
    fieldName:{ type: String, default: 'Main Field' },
  },

  season:  { type: String, enum: ['Kharif', 'Rabi', 'Zaid', ''], default: '' },
  notes:   { type: String, default: '' },
}, { timestamps: true });

soilAnalysisSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('SoilAnalysis', soilAnalysisSchema);
