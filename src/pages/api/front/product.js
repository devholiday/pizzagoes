import { withSessionRoute } from '@/src/common/lib/withSession';
import dbConnect from '@/src/common/lib/dbConnect';
import Product from '@/src/common/models/Product';
import Option from '@/src/common/models/Option';
import Variant from '@/src/common/models/Variant';
import Ingredient from '@/src/common/models/Ingredient';
import Discount from '@/src/common/models/Discount';
import User from '@/src/common/models/User';
import {getPrice} from '@/src/common/utils/currency';

export default withSessionRoute(handler);

async function handler(req, res) {
  try {
    await dbConnect();

    const userId = req.session.user ? req.session.user.id : null;

    const {productId} = req.query;

    const labels = [];

    const product = await Product.findOne({_id: productId, status: 'active'});
    if (!product) {
      throw("not found product");
    }

    const variants = await (async function(productId) {
      try {
        const variants = await Variant.find({productId});
        if (!variants.length) {
          throw("not found variant");
        }
        
        return variants.map(v => {
          const images = v.images.map(imageId => product.images.find(image => image.id === imageId));

          return {
            id: v.id,
            productId: v.productId,
            options: v.options,
            ingredients: v.ingredients,
            price: v.price,
            grams: v.grams,
            displayAmount: v.displayAmount,
            unit: v.unit,
            image: images.length ? images[0] : null,
            images,
          }
        })
      } catch(e) {
        throw(e);
      }
    })(product.id);

    const options = await Option.find({productId: product.id});

    const ingredients = await Ingredient.find({enabled: true});
    const ingredientsProduct = product.compound.map(c => {
      const ingredient = ingredients.find(i => i.id === c.ingredientId.toString())
      return {
        title: ingredient.title
      }
    });

    const images = product.images.map(img => ({
      src: img.src,
      srcWebp: img.srcWebp,
      width: img.width,
      height: img.height,
      alt: img.alt
    }));

    res.status(200).json({
      product: {
        id: product.id,
        title: product.title,
        subTitle: product.subTitle,
        image: images.length ? images[0] : null,
        images,
        availableForSale: product.availableForSale,
        labels,
        ingredientsProduct,
        options,
        variants,
        ingredients: ingredients.filter(i => !i.hidden)
      }
    });
  } catch(e) {
    res.status(500).json({ error: 'failed to load data', product: {} });
  }
}