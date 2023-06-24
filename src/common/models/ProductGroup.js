import mongoose from 'mongoose'

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Image = new Schema({
    filename: String,
    alt: String,
    ext: String,
    width: Number,
    height: Number,
    position: {
        type: Number,
        default: 1
    }
});
Image.set('toObject', { virtuals: true });
Image.set('toJSON', { virtuals: true });

Image.virtual('src').get(function() {
    return `${process.env.UPLOAD_URL}/product_groups/${this.parent().id}/${this.filename}.${this.ext}`;
});
Image.virtual('srcWebp').get(function() {
    return `${process.env.UPLOAD_URL}/product_groups/${this.parent().id}/${this.filename}.webp`;
});

const Variant = new Schema({
    variantId: {
        type: ObjectId,
        required: true
    },
    price: {
        type: Number,
        min: 0.00,
        maxlength: 15,
        default: 0.00
    }
});

const Product = new Schema({
    productId: {
        type: ObjectId,
        required: true
    },
    variants: [Variant]
});

const ProductGroupSchema = new Schema({
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
        },
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
        },
    },
    handle: String,
    type: {
        type: String,
        required: true,
        enum: ['combo', 'halfs'],
        default: 'combo'
    },
    images: [Image],
    products: {
        type: [Product],
        default: []
    },
    enabled: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'archived', 'draft'],
        default: 'draft'
    }
});

ProductGroupSchema.set('toObject', { virtuals: true });
ProductGroupSchema.set('toJSON', { virtuals: true });

export default mongoose.models.ProductGroup || mongoose.model('ProductGroup', ProductGroupSchema)