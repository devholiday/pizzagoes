import { withSessionRoute } from '@/src/common/lib/withSession';
import dbConnect from '@/src/common/lib/dbConnect';
import Product from '@/src/common/models/Product';
import Option from '@/src/common/models/Option';
import Variant from '@/src/common/models/Variant';
import Ingredient from '@/src/common/models/Ingredient';
import ProductGroup from '@/src/common/models/ProductGroup';

export default withSessionRoute(handler);

async function handler(req, res) {
  try {
    await dbConnect();

    const userId = req.session.user ? req.session.user.id : null;

    const {handle} = req.query;

    const productGroup = await ProductGroup.findOne({handle, status: 'active'});
    if (!productGroup) {
      throw("not found productGroup");
    }

    const images = productGroup.images.map(img => ({
      src: img.src,
      srcWebp: img.srcWebp,
      width: img.width,
      height: img.height,
      alt: img.alt
    }));

    const options = await Option.find({productGroupId: productGroup.id});

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
            images
          }
        });

        const variant = variantList[0];

        const customIngredients = product.customIngredients.map(ingr => ({
          id: ingr.id,
          title: ingr.title,
          required: ingr.required
        }));

        result.push({
          id: product.id,
          title: product.title,
          subTitle: product.subTitle,
          image: variant.images[0],
          images,
          availableForSale: product.availableForSale,
          variants: variantList,
          customIngredients,
          minPrice
        });
      }

      return result;
    })(productGroup.products);

    res.status(200).json({
      productGroup: {
        id: productGroup.id,
        title: productGroup.title,
        subTitle: productGroup.subTitle,
        image: images.length ? images[0] : null,
        images,
        availableForSale: productGroup.availableForSale,
        products,
        options
      }
    });
  } catch(e) {
    res.status(500).json({ error: 'failed to load data', productGroup: {} });
  }
}