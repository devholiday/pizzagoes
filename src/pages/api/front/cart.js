import { v4 as uuidv4 } from 'uuid';
import { withSessionRoute } from '@/src/common/lib/withSession';
import dbConnect from '@/src/common/lib/dbConnect';
import Cart from '@/src/common/models/Cart';
import Variant from '@/src/common/models/Variant';
import Ingredient from '@/src/common/models/Ingredient';
import Discount from '@/src/common/models/Discount';
import User from '@/src/common/models/User';
import ResourceProduct from '@/src/common/resources/product';
import ResourceProductGroup from '@/src/common/resources/product-group';
import {getPrice} from '@/src/common/utils/currency';

export default withSessionRoute(handler);

async function handler(req, res) {
  try {
    await dbConnect();

    if (req.method === 'GET') {
      const cart = await handleGETAsync(req);
      return res.status(200).json(cart);
    }

    if (req.method === 'POST') {
      const cart = await handleBodyPOSTAsync(req, res);
      if (!req.cookies.cart) {
        const d = new Date();
        d.setTime(d.getTime() + (7*24*60*60*1000));
        const expires = "expires="+ d.toUTCString();
        res.setHeader('Set-Cookie', `cart=${cart.token}; ${expires}; path=/`);
      }
      return res.status(200).json(cart);
    }

    if (req.method === 'DELETE') {
      const cart = await handleBodyDELETEAsync(req);
      res.setHeader('Set-Cookie', 'cart=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;');

      return res.status(200).json({deletedCartId: cart.id});
    }

    res.status(200).json({
      totalPrice: 0,
      products: []
    });
  } catch(e) {
    res.status(200).json({
      totalPrice: 0,
      products: []
    });
  }
}

async function handleGETAsync(req) {
  try {
    const userId = req.session.user ? req.session.user.id : null;
    const token = req.cookies.cart;

    const cart = await (async function(userId, token) {
      try {
        const cartByToken = await Cart.findOne({token});
        if (!cartByToken) {
          return await Cart.findOne({userId: {$and: [{ $ne: null }, {$eq: userId}]}});
        }
        return cartByToken;
      } catch(e) {
        return null;
      }
    }(userId, token));
    if (!cart) {
      throw('Cart not exist');
    }

    const user = await User.findById(userId);
    const discountCode = user ? user.discount : 'new_user';

    const variantsV2 = await (async function(cartProducts) { 
      try {
        const products = await (async function() {
          const productIds = cartProducts.filter(p => !p.productGroupId).map(p => p.productId);
          const filter = {status: 'active', '_id': {$in: productIds}};
          const sort = [['availableForSale', 'desc'], ['sort', 'asc']];
          const options = {filter, projection: null, options: {skip: 0, limit: 400}, sort};
          const payload = {discountCode};
    
          return await ResourceProduct(options, payload);
        })();

        const productGroups = await (async function() {
          const productGroupIds = cartProducts.filter(p => p.productGroupId).map(p => p.productGroupId);
          const filter = {status: 'active', '_id': {$in: productGroupIds}};
          const sort = [['availableForSale', 'desc'], ['sort', 'asc']];
          const options = {filter, projection: null, options: {skip: 0, limit: 400}, sort};
          const payload = {discountCode};
  
          return await ResourceProductGroup(options, payload);
        })();

        const result = [];
        for (let cartProduct of cartProducts) {
          const {productGroupId, productId, variantId, ingredientIds, customIngredientIds} = cartProduct;
  
          if (!productGroupId) {
            const product = products.find(p => p.id === productId.toString());
            const variant = product.variants.find(v => v.id === variantId.toString());
  
            const excludeCustomIngredients = product.customIngredients.filter(ingr => !customIngredientIds.includes(ingr.id));
  
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
              displayAmount: variant.displayAmount,
              unit: variant.unit,
              image: variant.image,
              images: variant.images,
              availableForSale: variant.availableForSale,
              options: variant.options,
              ingredientIds: cartProduct.ingredientIds,
              quantity: cartProduct.quantity,
              cartProductId: cartProduct._id,
              ingredients,
              excludeCustomIngredients
            });
          } else {
            const existedProductGroupIndex = result.findIndex(p => p.productGroupId && p.productGroupId.toString() === productGroupId.toString());

            const productGroup = productGroups.find(pg => pg.id === productGroupId.toString());
            const product = productGroup.products.find(p => p.id === productId.toString());
            const variant = product.variants.find(v => v.id === variantId.toString());
  
            const excludeCustomIngredients = product.customIngredients.filter(ingr => !customIngredientIds.includes(ingr.id));

            const ingredients = ingredientIds.map(ingrId => product.allIngredients.find(i => i.id === ingrId));
            const ingrSum = ingredients.reduce((acc, ingr) => acc+=ingr.price, 0);
  
            let price = variant.price;
            price += ingrSum;
            price += ingredients.length * variant.ingredients.priceInc;

            if (existedProductGroupIndex === -1) {
              result.push({
                id: variant.id,
                productGroupId,
                productId: variant.productId,
                variantIds: [variant.id],
                title: product.title,
                price,
                grams: variant.grams,
                displayAmount: variant.displayAmount,
                unit: variant.unit,
                image: productGroup.image,
                images: productGroup.images,
                availableForSale: variant.availableForSale,
                options: variant.options,
                ingredientIds: cartProduct.ingredientIds,
                quantity: cartProduct.quantity,
                cartProductId: cartProduct._id,
                ingredients,
                excludeCustomIngredients
              });
            } else {
              if (productGroup.type === 'halfs') {
                Object.keys(product.title).forEach(lang => {
                  result[existedProductGroupIndex]['title'][lang] += ` + ${product.title[lang]}`;
                });
              }

              result[existedProductGroupIndex]['price'] += variant.price;
              result[existedProductGroupIndex]['variantIds'].push(variant.id);
            }
          }
        }

        return result;
      } catch(e) {
        return [];
      }
    })(cart ? cart.products : []);

    const products = await (async function(cartProducts) {
      const result = [];
      for (let cartProduct of cartProducts) {
        if (!cartProduct.productGroupId) {
          result.push({
            productGroupId: cartProduct.productGroupId,
            productId: cartProduct.productId,
            variantId: cartProduct.variantId,
            ingredientIds: cartProduct.ingredientIds,
            customIngredientIds: cartProduct.customIngredientIds,
            quantity: cartProduct.quantity,
            id: cartProduct.id
          });
        } else {
          const existedProductGroupIndex = result.findIndex(p => p.productGroupId && p.productGroupId.toString() === cartProduct.productGroupId.toString());
          if (existedProductGroupIndex === -1) {
            result.push({
              productGroupId: cartProduct.productGroupId,
              productId: cartProduct.productId,
              variantId: cartProduct.variantId,
              ingredientIds: cartProduct.ingredientIds,
              customIngredientIds: cartProduct.customIngredientIds,
              quantity: cartProduct.quantity,
              id: cartProduct.id
            });
          } else {
            // result[existedProductGroupIndex]['quantity'] = cartProduct.quantity;
          }
        }
      }
      return result;
    })(cart ? cart.products : []);

    return {
      id: cart.id,
      token: cart.token,
      userId: cart.userId,
      totalShippingPrice: cart.totalShippingPrice,
      totalLineItemsPrice: cart.totalLineItemsPrice,
      totalDiscounts: cart.totalDiscounts,
      subtotalPrice: cart.subtotalPrice,
      totalPrice: cart.totalPrice,
      minTotalPrice: cart.minTotalPrice,
      products,
      variantsV2
    };
  } catch(e) {
    throw e;
  }
}
async function handleBodyPOSTAsync(req, res) {
  try {
    const userId = req.session.user ? req.session.user.id : null;
    const token = req.cookies.cart || uuidv4();
    const {productGroupId, productId, variantId, cartProductId, action, ingredientIds=[], customIngredientIds=[]} = req.body;

    const user = await User.findById(userId);
    const discountCode = user ? user.discount : 'new_user';

    const cart = await (async function(userId, token) {
      try {
        const cartByToken = await Cart.findOne({token});
        if (!cartByToken) {
          return await Cart.findOne({$and: [{ userId: {$ne: null} }, { userId }]});
        }
        return cartByToken;
      } catch(e) {
        return null;
      }
    }(userId, token));

    const cartProducts = await (async function(productGroupId, productId, variantId, cartProductId, action, ingredientIds, customIngredientIds, cartProducts) {
      try {
        if (!variantId) {
          return cartProducts;
        }

        function isVariantInCart() {
          for (let p of cartProducts) {
            
            if (productGroupId) {
              if (p.productGroupId.toString() === productGroupId) {
                let result = true;
  
                if (p.variantId.toString() !== variantId) {
                  result = false;
                }
  
                if (result) {
                  return p;
                }
              }
            }

            if (!productGroupId) {
              if (p.id === cartProductId) {
                return p;
              }

              if (p.variantId.toString() === variantId) {
                let result = true;
  
  
                if (p.ingredientIds.length === ingredientIds.length) {
                  for (let ingrId of ingredientIds) {
                    if (!p.ingredientIds.includes(ingrId)) {
                      result = false;
                    }
                  }
                } else {
                  result = false;
                }
  
                if (p.customIngredientIds.length === customIngredientIds.length) {
                  for (let ingrId of customIngredientIds) {
                    if (!p.customIngredientIds.includes(ingrId)) {
                      result = false;
                    }
                  }
                } else {
                  result = false;
                }
                
                if (result) {
                  return p;
                }
              }
            }
          }
          return null;
        }

        const variant = await Variant.findById(variantId);
        if (!variant) {
          throw('no variant in DB');
        }

        productId = variant.productId;

        ingredientIds = ingredientIds.filter(ingrId => !variant.ingredients.denyIds.includes(ingrId));
       
        const product = (function() {
          // if (productGroupId) {
          //   return cartProducts.find(p => p.productGroupId && p.productGroupId.toString() === productGroupId) || isVariantInCart();
          // } else {
          //   return cartProducts.find(p => p.id === cartProductId) || isVariantInCart();
          // }

          return isVariantInCart();
        })();

        if (!product) {
          return cartProducts.concat({productGroupId, productId, variantId, quantity: 1, ingredientIds, customIngredientIds});
        }

        const quantity = (function(quantity, action) {
          if (action === 'inc') return quantity + 1;
          if (action === 'dec') return quantity - 1;
          return quantity;
        })(product.quantity, action);
  
        if (quantity < 1) {
          return cartProducts.filter(p => p.id !== cartProductId);
        }
  
        return cartProducts.map(p => ({
          _id: p._id,
          productGroupId: p.productGroupId,
          productId: p.productId,
          variantId: p.variantId,
          quantity: p.id === product.id ? quantity : p.quantity,
          ingredientIds: p.id === product.id ? ingredientIds : p.ingredientIds,
          customIngredientIds: p.customIngredientIds
        }));
      } catch(e){
        throw(e);
      }
    })(productGroupId, productId, variantId, cartProductId, action, ingredientIds, customIngredientIds, cart ? cart.products : []);
    if (!cartProducts.length) {
      await Cart.findByIdAndRemove(cart.id);
      res.setHeader('Set-Cookie', 'cart=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;');

      return {
        totalPrice: 0,
        products: []
      };
    }

    const totals = await (async function(cartProducts) {
      let totalShippingPrice = 0;
      let totalLineItemsPrice = 0;
      let totalDiscounts = 0;
      let subtotalPrice = 0;
      let totalPrice = 0;
      let minTotalPrice = 0;

      const variantIds = cartProducts.map(p => p.variantId);
      if (!variantIds.length) {
        throw('no variants in cart')
      }

      const variants = await Variant.find({_id: {$in: variantIds}, enabled: true}, 'price ingredients');
      if (!variants.length) {
        throw('no variants in DB');
      }

      const discount = await Discount.findOne(
        {
          status: 'active', code: discountCode, 
          startedAt: {$lt: new Date()}, finishedAt: {$gt: new Date()}
        }
      );
      const ingredientsFromDB = await Ingredient.find({});

      for (let cartProduct of cartProducts) {
        const {productId, quantity, variantId, ingredientIds} = cartProduct;

        const variant = variants.find(v => v.id === variantId.toString());

        const ingredients = ingredientIds.map(ingrId => ingredientsFromDB.find(i => i.id === ingrId));
        const ingrSum = ingredients.reduce((acc, ingr) => acc+=ingr.price, 0);

        let price = variant.price;
        price += ingrSum;
        price += ingredients.length * variant.ingredients.priceInc;

        totalLineItemsPrice += price*quantity;

        if (discount) {
          const custom = discount.products.custom.find(c => c.productId.toString() === productId.toString());
          if (custom) {
            if (custom.percentage) {
              totalDiscounts += price*quantity*custom.percentage/100;
            }
            if (custom.amount) {
              const q = quantity % custom.quantity === 0 ? quantity : quantity - 1;
              if (q) {
                totalDiscounts += custom.amount*(q/custom.quantity); 
              }
            }
          } else if (discount.products.all.enabled) {
            if (!discount.products.all.excludeProductIds.includes(productId)) {
              totalDiscounts += price*quantity*discount.products.all.percentage/100;
            }
          }
  
          if (discount.shipping.all.enabled) {
            totalShippingPrice -= totalShippingPrice*discount.shipping.all.percentage/100;
          }
          if (discount.order.minTotalPrice) {
            minTotalPrice = discount.order.minTotalPrice;
          }
        }
      }

      totalLineItemsPrice = getPrice(totalLineItemsPrice);
      totalDiscounts = getPrice(totalDiscounts);
      subtotalPrice = getPrice(totalLineItemsPrice - totalDiscounts);
      totalPrice = getPrice(subtotalPrice + totalShippingPrice);
      minTotalPrice = getPrice(minTotalPrice);

      return {totalShippingPrice, totalLineItemsPrice, totalDiscounts, subtotalPrice, totalPrice, minTotalPrice};
    })(cartProducts);

    const updCart = await (async function(token, isCart, payload) {
      try {
        if (isCart) {
          return await Cart.findByIdAndUpdate(cart.id, {...payload, token, updatedAt: Date.now()}, {new: true});
        }

        return await Cart.create({...payload, token});
      } catch(e) {
        throw(e);
      }
    })(token, !!cart, {...totals, products: cartProducts, userId});

    const variantsV2 = await (async function(cartProducts) { 
      try {
        const products = await (async function() {
          const productIds = cartProducts.filter(p => !p.productGroupId).map(p => p.productId);
          const filter = {status: 'active', '_id': {$in: productIds}};
          const sort = [['availableForSale', 'desc'], ['sort', 'asc']];
          const options = {filter, projection: null, options: {skip: 0, limit: 400}, sort};
          const payload = {discountCode};
    
          return await ResourceProduct(options, payload);
        })();

        const productGroups = await (async function() {
          const productGroupIds = cartProducts.filter(p => p.productGroupId).map(p => p.productGroupId);
          const filter = {status: 'active', '_id': {$in: productGroupIds}};
          const sort = [['availableForSale', 'desc'], ['sort', 'asc']];
          const options = {filter, projection: null, options: {skip: 0, limit: 400}, sort};
          const payload = {discountCode};
  
          return await ResourceProductGroup(options, payload);
        })();

        const result = [];
        for (let cartProduct of cartProducts) {
          const {productGroupId, productId, variantId, ingredientIds, customIngredientIds} = cartProduct;
  
          if (!productGroupId) {
            const product = products.find(p => p.id === productId.toString());
            const variant = product.variants.find(v => v.id === variantId.toString());
  
            const excludeCustomIngredients = product.customIngredients.filter(ingr => !customIngredientIds.includes(ingr.id));
  
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
              displayAmount: variant.displayAmount,
              unit: variant.unit,
              image: variant.image,
              images: variant.images,
              availableForSale: variant.availableForSale,
              options: variant.options,
              ingredientIds: cartProduct.ingredientIds,
              quantity: cartProduct.quantity,
              cartProductId: cartProduct._id,
              ingredients,
              excludeCustomIngredients
            });
          } else {
            const existedProductGroupIndex = result.findIndex(p => p.productGroupId && p.productGroupId.toString() === productGroupId.toString());

            const productGroup = productGroups.find(pg => pg.id === productGroupId.toString());
            const product = productGroup.products.find(p => p.id === productId.toString());
            const variant = product.variants.find(v => v.id === variantId.toString());
  
            const excludeCustomIngredients = product.customIngredients.filter(ingr => !customIngredientIds.includes(ingr.id));

            const ingredients = ingredientIds.map(ingrId => product.allIngredients.find(i => i.id === ingrId));
            const ingrSum = ingredients.reduce((acc, ingr) => acc+=ingr.price, 0);
  
            let price = variant.price;
            price += ingrSum;
            price += ingredients.length * variant.ingredients.priceInc;

            if (existedProductGroupIndex === -1) {
              result.push({
                id: variant.id,
                productGroupId,
                productId: variant.productId,
                variantIds: [variant.id],
                title: product.title,
                price,
                grams: variant.grams,
                displayAmount: variant.displayAmount,
                unit: variant.unit,
                image: productGroup.image,
                images: productGroup.images,
                availableForSale: variant.availableForSale,
                options: variant.options,
                ingredientIds: cartProduct.ingredientIds,
                quantity: cartProduct.quantity,
                cartProductId: cartProduct._id,
                ingredients,
                excludeCustomIngredients
              });
            } else {
              if (productGroup.type === 'halfs') {
                Object.keys(product.title).forEach(lang => {
                  result[existedProductGroupIndex]['title'][lang] += ` + ${product.title[lang]}`;
                });
              }

              result[existedProductGroupIndex]['price'] += variant.price;
              result[existedProductGroupIndex]['variantIds'].push(variant.id);
            }
          }
        }

        return result;
      } catch(e) {
        return [];
      }
    })(updCart.products);

    return {
      id: updCart.id,
      token: updCart.token,
      userId: updCart.userId,
      totalShippingPrice: updCart.totalShippingPrice,
      totalLineItemsPrice: updCart.totalLineItemsPrice,
      totalDiscounts: updCart.totalDiscounts,
      subtotalPrice: updCart.subtotalPrice,
      totalPrice: updCart.totalPrice,
      minTotalPrice: updCart.minTotalPrice,
      products: updCart.products,
      variantsV2
    };
  } catch(e) {
    throw e;
  }
}
async function handleBodyDELETEAsync(req) {
  try {
    const {id} = req.query;
    const cart = await Cart.findOneAndRemove({_id: id});
    if (!cart) {
      throw('cart error');
    }

    return cart;
  } catch(e) {
      throw e;
  }
}