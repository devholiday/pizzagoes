import { v4 as uuidv4 } from 'uuid';

import { withSessionRoute } from '@/src/common/lib/withSession';
import dbConnect from '@/src/common/lib/dbConnect';
import {getNextSequence} from '@/src/common/lib/counter';
import Cart from '@/src/common/models/Cart';
import Order from '@/src/common/models/Order';
import User from '@/src/common/models/User';
import Product from '@/src/common/models/Product';
import Location from '@/src/common/models/Location';
import Discount from '@/src/common/models/Discount';
import {getDateV2} from '@/src/common/utils/date';
import {getPrice} from '@/src/common/utils/currency';
import ResourceProduct from '@/src/common/resources/product';
import { validateString, validateBoolean } from '@/src/common/utils/validators';

export default withSessionRoute(handler);

async function handler(req, res) {
  try {
    await dbConnect();

    const {id: userId} = req.session.user;
    if (!userId) {
      throw(new Error('Error, auth.'));
    }

    if (req.method === 'GET') {
      const orders = await handleGETAsync(userId, req.query);
      return res.status(200).json(orders);
    }

    if (req.method === 'POST') {
      const order = await handleBodyPOSTAsync(userId, req, res);
      return res.status(200).json(order);
    }

    res.status(200).json([]);
  } catch(e) {
    res.status(200).json([]);
  }
}

async function handleGETAsync(userId) {
  try {
      const user = await User.findById(userId);
      if (!user) {
        throw(new Error('User not exist'));
      }

      const output = [];

      const orders = await Order.find({userId}, null, {skip: 0, limit: 35}).sort([['createdAt', 'desc']]);
      for(let order of orders) {
        const date = getDateV2(order.createdAt);

        const productIds = order.lineItems.map(i => i.productId);
        const products = await Product.find({'_id': {$in: productIds}});
        const lineItems = order.lineItems.map(item => {
          const product = products.find(p => p.id === String(item.productId));
          const images = product.images.map(img => ({
            src: img.src,
            srcWebp: img.srcWebp,
            width: img.width,
            height: img.height,
            alt: img.alt
          }));

          return {
            id: item.id,
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            ingredients: item.ingredients,
            customIngredients: item.customIngredients,
            image: images.length ? images[0] : null
          };
        });

        let status = 'pending';
        if (order.financialStatus === 'paid' && order.fulfillmentStatus === 'fulfilled') {
          status = 'completed';
        }
        if (order.cancelledAt) {
          status = 'canceled';
        }

        output.push({
          id: order.id,
          orderNumber: order.orderNumber,
          token: order.token,
          totalShippingPrice: order.totalShippingPrice,
          totalLineItemsPrice: order.totalLineItemsPrice,
          totalDiscounts: order.totalDiscounts,
          subtotalPrice: order.subtotalPrice,
          totalPrice: order.totalPrice,
          financialStatus: order.financialStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          lineItems,
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt,
          date,
          status
        });
      }

      return output;
  } catch(e) {
      throw e;
  }
}
async function handleBodyPOSTAsync(userId, req, res) {
  try {
    const orderBody = req.body;

    const {errors: errorsForm, data: validatedData} = (function(data) {
      try {
        const errors = [];
        const output = {};

        output.shippingAddress = (function() {
          const outputShippingAddress = {};

          if (data.hasOwnProperty('shippingAddress')) {
              const {shippingAddress} = data;

              const {address1} = shippingAddress;
              const [errorsAddress1, valueAddress1] = validateString(address1, {require: true, max: 550});
              if (errorsAddress1.length > 0) {
                  errors.push({field: ['shippingAddress', 'address1'], message: errorsAddress1[0]});
              }
              outputShippingAddress.address1 = valueAddress1;

              if (shippingAddress.hasOwnProperty('address2')) {
                const {address2} = shippingAddress;
                const [errorsAddress2, valueAddress2] = validateString(address2, {max: 550});
                if (errorsAddress2.length > 0) {
                    errors.push({field: ['shippingAddress', 'address2'], message: errorsAddress2[0]});
                }
                outputShippingAddress.address2 = valueAddress2;
              }
              if (shippingAddress.hasOwnProperty('entrance')) {
                  const {entrance} = shippingAddress;
                  const [errorsEntrance, valueEntrance] = validateString(entrance, {max: 100});
                  if (errorsEntrance.length > 0) {
                      errors.push({field: ['shippingAddress', 'entrance'], message: errorsEntrance[0]});
                  }
                  outputShippingAddress.entrance = valueEntrance;
              }
              if (shippingAddress.hasOwnProperty('floor')) {
                  const {floor} = shippingAddress;
                  const [errorsFloor, valueFloor] = validateString(floor, {max: 5});
                  if (errorsFloor.length > 0) {
                      errors.push({field: ['shippingAddress', 'floor'], message: errorsFloor[0]});
                  }
                  outputShippingAddress.floor = valueFloor;
              }
              if (shippingAddress.hasOwnProperty('doorcode')) {
                  const {doorcode} = shippingAddress;
                  const [errorsDoorcode, valueDoorcode] = validateString(doorcode, {max: 10});
                  if (errorsDoorcode.length > 0) {
                      errors.push({field: ['shippingAddress', 'doorcode'], message: errorsDoorcode[0]});
                  }
                  outputShippingAddress.doorcode = valueDoorcode;
              }
              if (shippingAddress.hasOwnProperty('comment')) {
                  const {comment} = shippingAddress;
                  const [errorsComment, valueComment] = validateString(comment, {max: 650});
                  if (errorsComment.length > 0) {
                      errors.push({field: ['shippingAddress', 'comment'], message: errorsComment[0]});
                  }
                  outputShippingAddress.comment = valueComment;
              }
              if (shippingAddress.hasOwnProperty('options')) {
                const {options} = shippingAddress;
                outputShippingAddress.options = {};
                if (shippingAddress.options) {
                    if (options.hasOwnProperty('leaveAtTheDoor')) {
                      const {leaveAtTheDoor} = options;
                      const [errorsLeaveAtTheDoor, valueLeaveAtTheDoor] = validateBoolean(leaveAtTheDoor);
                      if (errorsLeaveAtTheDoor.length > 0) {
                          errors.push({field: ['options', 'leaveAtTheDoor'], message: errorsLeaveAtTheDoor[0]});
                      }
                      outputShippingAddress.options.leaveAtTheDoor = valueLeaveAtTheDoor;
                    }
                }
            }
          }

          return outputShippingAddress;
        })();

        return {errors, data: output};
      } catch(e) {
        return {errors: [{message: e.message}]};
      }
    })(orderBody);
    if (Object.keys(errorsForm).length > 0) {
      return {
        order: null,
        userErrors: errorsForm
      };
    }

    const {errors: errorsDB, data: savedData} = await (async function(data, payload) {
      try {
        const {userId} = payload;

        const errors = [];
        const output = {};

        if (!userId) {
          throw(new Error('userId not found'));
        }

        const user = await User.findById(userId);
        const discountCode = user.discount;

        const cart = await Cart.findOne({userId}).sort({_id: -1});
        if (!cart) {
          throw(new Error('Cart not found'));
        }

        const location = await Location.findOne({userId}).sort({_id: -1});
        if (!location) {
          throw(new Error('Location not found'));
        }

        let discountToSave = null;
        const discount = await Discount.findOne(
          {
            status: 'active', code: discountCode, 
            startedAt: {$lt: new Date()}, finishedAt: {$gt: new Date()}
          }
        );
        if (discount) {
          discountToSave = {
            discountId: discount.id,
            title: discount.title,
            code: discount.code,
            startedAt: discount.startedAt,
            finishedAt: discount.finishedAt
          };
        }

        const variantsV2 = await (async function(cartProducts) {
          try {
            const productIds = cartProducts.map(p => p.productId);
            const filter = {status: 'active', '_id': {$in: productIds}};
            const sort = [['availableForSale', 'desc'], ['sort', 'asc']];
            const options = {filter, projection: null, options: {skip: 0, limit: 400}, sort};
            const payload = {discountCode};
            const products = await ResourceProduct(options, payload);

            const result = [];
            for (let cartProduct of cartProducts) {
              const {productId, variantId, ingredientIds, customIngredientIds} = cartProduct;

              const product = products.find(p => p.id === productId.toString());
              const variant = product.variants.find(v => v.id === variantId.toString());

              const customIngredients = customIngredientIds.map(ingrId => {
                const ingr = product.customIngredients.find(i => i.id === ingrId);
                return {
                  title: ingr.title
                };
              });

              const ingredients = ingredientIds.map(ingrId => product.allIngredients.find(i => i.id === ingrId));
              const ingrSum = ingredients.reduce((acc, ingr) => acc+=ingr.price, 0);

              let price = variant.price;
              price += ingrSum;
              price += ingredients.length * variant.ingredients.priceInc;

              result.push({
                id: variant.id,
                productId: variant.productId,
                title: product.title,
                price,
                grams: variant.grams,
                unitCost: variant.unitCost,
                pricePerUnit: variant.pricePerUnit,
                displayAmount: variant.displayAmount,
                unit: variant.unit,
                image: variant.image,
                images: variant.images,
                amountPerUnit: variant.amountPerUnit,
                availableForSale: variant.availableForSale,
                options: variant.options,
                ingredientIds: cartProduct.ingredientIds,
                quantity: cartProduct.quantity,
                cartProductId: cartProduct._id,
                ingredients,
                customIngredients
              });
            }
  
            return result;
          } catch(e) {
            throw(e);
          }
        })(cart.products);

        let totalWeight = 0;
        const lineItems = variantsV2.map(variant => {
          let price = getPrice(variant.price);

          totalWeight += variant.grams*variant.quantity;

          return {
            variantId: variant.id,
            productId: variant.productId,
            title: variant.title,
            price,
            quantity: variant.quantity,
            unit: variant.unit,
            grams: variant.grams,
            displayAmount: variant.displayAmount,
            ingredients: variant.ingredients,
            customIngredients: variant.customIngredients,
            options: variant.options
          };
        });
        totalWeight = getPrice(totalWeight);

        const totalShippingPrice = cart.totalShippingPrice;
        const totalLineItemsPrice = cart.totalLineItemsPrice;
        const totalDiscounts = cart.totalDiscounts;
        const subtotalPrice = cart.subtotalPrice;
        const totalPrice = cart.totalPrice;
        const minTotalPrice = cart.minTotalPrice;

        if (totalPrice < minTotalPrice) {
          throw(new Error('Minimum total price is ' + minTotalPrice));
        }

        if (errors.length > 0) {
          return {errors};
        }

        const seq = await getNextSequence('orderId');
        const order = await Order.create({
          ...data,
          userId, 
          number: seq,
          orderNumber: 1000 + seq,
          token: uuidv4(),
          financialStatus: 'pending',
          lineItems,
          discount: discountToSave,
          totalShippingPrice,
          totalLineItemsPrice, 
          totalDiscounts,
          subtotalPrice,
          totalPrice,
          totalWeight
        });
        if (!order) {
          throw(new Error('Failed to add order'));
        }

        const {id: orderId} = order;
        output.orderId = orderId;

        await Cart.findByIdAndRemove(cart.id);
        await Location.findOneAndUpdate({userId}, {address: data.shippingAddress});
        await User.findByIdAndUpdate(userId, {discount: 'regular'});

        res.setHeader('Set-Cookie', 'cart=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;');

        // send alert of new order to admin dashboard
        const response = await fetch(process.env.DOMAIN + '/admin/api/alert/new_order', {method: 'POST',  headers: {
          'Content-Type': 'application/json',
        }, body: JSON.stringify({id: orderId})});
        await response.json();

        return {errors, data: output};
      } catch (e) {
        return {errors: [{message: e.message}]};
      }
    })(validatedData, {userId});
    if (Object.keys(errorsDB).length > 0) {
      return {
        order: null,
        userErrors: errorsDB
      };
    }

    const {errors: errorsRes, data: obtainedData} = await (async function(data, payload) {
      try {
          const errors = [];
          const output = {};

          const {orderId} = data;
          const {userId} = payload;

          const order = await Order.findOne({_id: orderId, userId});
          if (!order) {
            throw(new Error('Order not found'));
          }

          output.order = {
            id: orderId,
            orderNumber: order.orderNumber,
            token: order.token,
            totalShippingPrice: order.totalShippingPrice,
            totalLineItemsPrice: order.totalLineItemsPrice,
            totalDiscounts: order.totalDiscounts,
            subtotalPrice: order.subtotalPrice,
            totalPrice: order.totalPrice,
            financialStatus: order.financialStatus,
            fulfillmentStatus: order.fulfillmentStatus,
            lineItems: order.lineItems,
            shippingAddress: order.shippingAddress,
            createdAt: order.createdAt
          };

          return {errors, data: output};
      } catch (e) {
          return {errors: [{message: e.message}]};
      }
    })(savedData, {userId});
    if (Object.keys(errorsRes).length > 0) {
        return {
          order: null,
          userErrors: errorsRes
        }
    }

    return {
      order: obtainedData.order,
      userErrors: []
    };
  } catch(e) {
    return {errors: [{message: e.message}]};
  }
}