import mongoose from 'mongoose'

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const OptionSchema = new Schema({
  productId: {
    type: ObjectId,
    required: true
  },
  name: {
    en: {
        type: String,
        maxlength: 255,
        required: true
    },
    he: {
        type: String,
        maxlength: 255,
        required: true
    },
    ru: {
        type: String,
        maxlength: 255,
        required: true
    }
  },
  position: {
    type: Number,
    default: 1
  },
  values: {
    type: Array,
    default: [{
        title: {
            en: {
                type: String,
                maxlength: 255,
                required: true
            },
            he: {
                type: String,
                maxlength: 255,
                required: true
            },
            ru: {
                type: String,
                maxlength: 255,
                required: true
            }
        },
        subTitle: {
            en: {
                type: String,
                maxlength: 255,
                required: true
            },
            he: {
                type: String,
                maxlength: 255,
                required: true
            },
            ru: {
                type: String,
                maxlength: 255,
                required: true
            }
        }
    }]
  },
  defaultValue: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdBy: {
    type: ObjectId,
    required: true
  }
});

OptionSchema.set('toObject', { virtuals: true });
OptionSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Option || mongoose.model('Option', OptionSchema)