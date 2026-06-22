import mongoose from 'mongoose';

const pricePointSchema = new mongoose.Schema({
  date:  { type: Date, default: Date.now },
  price: { type: Number, required: true },
  mandi: { type: String, default: '' },
}, { _id: false });

const marketPriceSchema = new mongoose.Schema({
  cropName:   { type: String, required: true, index: true },
  variety:    { type: String, default: '' },

  /* Current price */
  price:      { type: Number, required: true },
  unit:       { type: String, default: '₹/qtl' },
  msp:        { type: Number, default: 0 },

  /* Change */
  prevPrice:  { type: Number, default: 0 },
  change:     { type: Number, default: 0 },
  changePct:  { type: Number, default: 0 },
  trend:      { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },

  /* Location */
  state:      { type: String, default: 'Punjab', index: true },
  district:   { type: String, default: '' },
  mandiName:  { type: String, default: '' },

  /* 30-day history (last 30 entries) */
  history:    [pricePointSchema],

  /* AI recommendation */
  sellAdvice: { type: String, default: '' },
  forecastPrice: { type: Number, default: 0 },
  forecastDays:  { type: Number, default: 30 },

  source:     { type: String, default: 'AgriMate' },
  fetchedAt:  { type: Date, default: Date.now },
}, { timestamps: true });

marketPriceSchema.index({ cropName: 1, state: 1 });
marketPriceSchema.index({ fetchedAt: -1 });

export default mongoose.model('MarketPrice', marketPriceSchema);
