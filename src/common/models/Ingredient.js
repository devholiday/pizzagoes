import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const Image = new Schema({
    filename: String,
    alt: String,
    ext: String,
    width: Number,
    height: Number
});
Image.set('toObject', { virtuals: true });
Image.set('toJSON', { virtuals: true });

Image.virtual('src').get(function() {
    return `${process.env.UPLOAD_URL}/ingredients/${this.filename}.${this.ext}`;
});

const IngredientSchema = new Schema({
    image: Image,
    title: {
        en: {
            type: String,
            maxlength: 255
        },
        he: {
            type: String,
            maxlength: 255
        },
        ru: {
            type: String,
            maxlength: 255
        },
    },
    price: {
        type: Number,
        min: 0.00,
        maxlength: 15,
        default: 0.00
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    hidden: {
        type: Boolean,
        default: false
    },
    enabled: {
        type: Boolean,
        default: false
    },
});

IngredientSchema.set('toObject', { virtuals: true });
IngredientSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Ingredient || mongoose.model('Ingredient', IngredientSchema)