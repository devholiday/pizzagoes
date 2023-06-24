import dbConnect from '@/src/common/lib/dbConnect';
import ProductGroup from '@/src/common/models/ProductGroup';
import Product from '@/src/common/models/Product';
import Variant from '@/src/common/models/Variant';
import Ingredient from '@/src/common/models/Ingredient';
import Discount from '@/src/common/models/Discount';
import {getPrice} from '@/src/common/utils/currency';

export default async function ResourceProductGroup({filter, projection=null, options, sort}, payload) {
    try {
        await dbConnect();

        const result = [];
        const productGroups = await ProductGroup.find(filter, projection, options).sort(sort);

        for (let productGroup of productGroups) {
          const images = productGroup.images.map(img => ({
            src: img.src,
            srcWebp: img.srcWebp,
            width: img.width,
            height: img.height,
            alt: img.alt
          }));

          const products = await (async function(productsPG) {
            const result = [];
      
            const productIds = productsPG.map(p => p.productId);
      
            const products = await Product.find({_id: {$in: productIds}, status: 'active'});
            if (!products) {
              throw("not found products");
            }
      
            for (let productPG of productsPG) {
              const product = products.find(p => p.id === productPG.productId.toString());
              if (!product) {
                continue;
              }
      
              const images = product.images.map(img => ({
                src: img.src,
                srcWebp: img.srcWebp,
                width: img.width,
                height: img.height,
                alt: img.alt
              }));
      
              const variantIds = productPG.variants.map(p => p.variantId);
              const variants = await Variant.find({_id: {$in: variantIds}});
              if (!variants.length) {
                continue;
              }
      
              const minPrice = productPG.variants.reduce((acc, v) => {
                if (v.price < acc) {
                  acc = v.price
                }
      
                return acc;
              }, variants[0]['price']);
      
              const variantList = variants.map(v => {
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
                  availableForSale: v.availableForSale
                }
              });
      
              const variant = variantList[0];
      
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
      
              result.push({
                id: product.id,
                title: product.title,
                customIngredients,
                allIngredients,
                image: images.length ? images[0] : null,
                images,
                minPrice,
                labels: [],
                availableForSale: product.availableForSale,
                variants,
                variant: variants[0]
              });
            }
      
            return result;
          })(productGroup.products);
    
          result.push({
            id: productGroup.id,
            title: productGroup.title,
            type: productGroup.type,
            image: images.length ? images[0] : null,
            images,
            availableForSale: productGroup.availableForSale,
            handle: productGroup.handle,
            products
          });
        }

        return result;
    } catch(e) {
      return [];
    }
}