import { withSessionRoute } from '@/src/common/lib/withSession';
import dbConnect from '@/src/common/lib/dbConnect';
import Collection from '@/src/common/models/Collection';
import Category from '@/src/common/models/Category';
import User from '@/src/common/models/User';
import ResourceProduct from '@/src/common/resources/product';

export default withSessionRoute(handler);

async function handler(req, res) {
  try {
    await dbConnect();

    const userId = req.session.user ? req.session.user.id : null;
    const user = await User.findById(userId);

    const discountCode = user ? user.discount : 'new_user'; 

    const linksWithProducts = [];
    
    const categories = await Category.find({enabled: true}, null, {skip: 0, limit: 45});
    for (let category of categories) {
      const collection = await Collection.findById(category.subjectId);
      if (!collection) {
        continue;
      }

      const {productIds} = collection;
      const filter = {status: 'active', '_id': {$in: productIds}};
      const options = {filter, projection: null, options: {skip: 0, limit: 400}, sort: [['availableForSale', 'desc'], ['sort', 'asc']]};
      const payload = {discountCode};
      const products = await ResourceProduct(options, payload);

      linksWithProducts.push({
        title: category.title,
        handle: category.handle,
        products
      });
    }

    res.status(200).json(linksWithProducts);
  } catch(e) {
    res.status(200).json(null);
  }
}