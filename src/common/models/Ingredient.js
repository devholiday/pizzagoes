import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const IngredientSchema = new Schema({
    image: {
        type: String,
        default: null
    },
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