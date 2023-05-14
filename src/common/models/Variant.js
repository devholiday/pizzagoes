import mongoose from 'mongoose'

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Options = new Schema({
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
  value: {
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
    },
    code: Number
  }
});
Options.set('toObject', { virtuals: true });
Options.set('toJSON', { virtuals: true });

const VariantSchema = new Schema({
  productId: {
    type: ObjectId,
    required: true
  },
  images: {
    type: Array,
    default: []
  },
  unitCost: {
    type: Number,
    min: 0.00,
    maxlength: 15,
    default: 0.00
},
  price: {
    type: Number,
    min: 0.00,
    maxlength: 15,
    default: 0.00
  },
  pricePerUnit: {
    type: Number,
    min: 0.00,
    maxlength: 15,
    default: 0.00
  },
  sort: Number,
  options: {
    type: [Options],
    default: []
  },
  quantity: {
    type: Number,
    default: 0
  },
  position: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  excludeDiscount: {
    type: Boolean,
    default: false
  },
  grams: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['g', 'kg', 'oz', 'lb', 'pc', 'ml', 'L'],
    default: 'g'
  },
  amountPerUnit: {
    type: Number,
    default: 0
  },
  displayAmount: String,
  currencyCode: {
    type: String,
    required: true,
    default: 'ILS'
  },
  availableForSale: {
    type: Boolean,
    default: true
  },  
  enabled: {
    type: Boolean,
    default: true
  },
  ingredients: {
    denyIds: Array,
    priceInc: Number
  }
});
VariantSchema.set('toObject', { virtuals: true });
VariantSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Variant || mongoose.model('Variant', VariantSchema)