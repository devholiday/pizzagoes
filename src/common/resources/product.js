import dbConnect from '@/src/common/lib/dbConnect';
import Product from '@/src/common/models/Product';
import Option from '@/src/common/models/Option';
import Variant from '@/src/common/models/Variant';
import Ingredient from '@/src/common/models/Ingredient';
import Discount from '@/src/common/models/Discount';
import {getPrice} from '@/src/common/utils/currency';

export default async function ResourceProduct({filter, projection=null, options, sort}, payload) {
    try {
        await dbConnect();

        const {discountCode = 'new_user'} = payload;

        const result = [];

        const products = await Product.find(filter, projection, options).sort(sort);
        const discount = await Discount.findOne(
          {
            status: 'active', code: discountCode, 
            startedAt: {$lt: new Date()}, finishedAt: {$gt: new Date()}
          }
        );

        for (let product of products) {
          const labels = [];

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
                  amountPerUnit: v.amountPerUnit,
                  displayAmount: v.displayAmount,
                  unit: v.unit,
                  unitCost: v.unitCost,
                  pricePerUnit: v.pricePerUnit,
                  options: v.options,
                  image: images.length ? images[0] : null,
                  images,
                  availableForSale: v.availableForSale
                }
              })
            } catch(e) {
              throw(e);
            }
          })(product.id);

          const ingredientsFromDB = await Ingredient.find({enabled: true});
          const customIngredients = product.customIngredients.map(ingr => ({
            id: ingr.id,
            title: ingr.title,
            required: ingr.required
          }));
          const allIngredients = product.ingredientIds.map(ingrId => {
            const ingredient = ingredientsFromDB.find(i => i.id === ingrId)
            return {
              id: ingredient.id,
              title: ingredient.title,
              price: ingredient.price
            }
          });

          const minPrice = variants.reduce((acc, v) => {
            if (v.price < acc) {
              acc = v.price
            }

            return acc;
          }, variants[0]['price']);

          let price = 0;
          if (discount) {
            const custom = discount.products.custom.find(c => c.productId.toString() === product.id);
            if (custom) {
              if (custom.isLabel) {
                labels.push(custom.title);
              }
              if (custom.percentage) {
                compareAtPrice = price;
                price -= getPrice(price*custom.percentage/100);
              }
            } else if (discount.products.all.enabled) {
              if (!discount.products.all.excludeProductIds.includes(product.id)) {
                compareAtPrice = price;
                price -= getPrice(price*discount.products.all.percentage/100);
              }
            }
          }

          const images = product.images.map(img => ({
            src: img.src,
            srcWebp: img.srcWebp,
            width: img.width,
            height: img.height,
            alt: img.alt
          }));
    
          result.push({
            id: product.id,
            title: product.title,
            customIngredients,
            allIngredients,
            image: images.length ? images[0] : null,
            images,
            minPrice,
            labels,
            availableForSale: product.availableForSale,
            variants,
            variant: variants[0]
          });
        }

        return result;
    } catch(e) {
      return [];
    }
}