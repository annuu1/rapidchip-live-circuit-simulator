import mongoose from 'mongoose';

const GraphSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'Untitled Graph',
      trim: true,
    },
    nodes: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    edges: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Graph || mongoose.model('Graph', GraphSchema);
