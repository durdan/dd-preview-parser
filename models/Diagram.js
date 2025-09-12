import mongoose from 'mongoose';

const DiagramSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Content is required']
  }
}, {
  timestamps: true
});

export default mongoose.models.Diagram || mongoose.model('Diagram', DiagramSchema);