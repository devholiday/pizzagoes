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

          const variants = await Variant.find({productId: product.id});
          
          if (!variants.length) {
            break;
          }

          const ingredientsFromDB = await Ingredient.find({enabled: true});
          const ingredients = product.compound.map(c => {
            const ingredient = ingredientsFromDB.find(i => i.id === c.ingredientId.toString())
            return {
              title: ingredient.title
            }
          });

          const minPrice = variants.reduce((acc, v) => {
            if (v.price < acc) {
              acc = v.price
            }

            return acc;
          }, variants[0]['price']);

          let compareAtPrice = 0;
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
            ingredients,
            image: images.length ? images[0] : null,
            images,
            minPrice,
            labels,
            availableForSale: product.availableForSale
          });
        }

        return result;
    } catch(e) {
      return [];
    }
}