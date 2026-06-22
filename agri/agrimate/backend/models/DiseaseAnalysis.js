import mongoose from 'mongoose';

const treatmentSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  dosage: { type: String, default: '' },
  method: { type: String, default: '' },
  type:   { type: String, enum: ['Chemical', 'Biological', 'Organic'], default: 'Chemical' },
}, { _id: false });

const diseaseAnalysisSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  /* CNN model metadata */
  model:        { type: String, default: 'CNN-AgriMate-v1' },
  architecture: { type: String, default: 'ResNet-50' },
  analysisType: { type: String, default: 'Convolutional Neural Network' },

  /* Image */
  imageUrl:     { type: String, default: '' },
  cropType:     { type: String, default: '' },

  /* Result */
  disease:      { type: String, required: true },
  confidence:   { type: Number, min: 0, max: 100 },
  severity:     { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  affectedArea: { type: String, default: '' },
  causes:       [{ type: String }],
  treatments:   [treatmentSchema],
  preventive:   [{ type: String }],

  /* Location context */
  location: {
    state:    { type: String, default: '' },
    district: { type: String, default: '' },
  },

  status:    { type: String, enum: ['pending', 'treated', 'resolved'], default: 'pending' },
  notes:     { type: String, default: '' },
}, { timestamps: true });

diseaseAnalysisSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('DiseaseAnalysis', diseaseAnalysisSchema);
