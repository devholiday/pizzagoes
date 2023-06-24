import {useState, useEffect} from 'react'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux';
import Error from '../_error'
import Image from 'next/image';
import Head from 'next/head'
import styles from '@/src/styles/Halfs.module.css'
import { useTranslation } from '@/src/common/hooks/useTranslation';
import ProductViewCardV2 from '@/src/common/components/product-view-card-v2';
import PizzaSVG from '@/public/icons/pizza';
import PizzaSmallSVG from '@/public/icons/pizza-small';
import {getPriceFormat} from '@/src/common/utils/currency';
import Button from '@/src/common/components/elements/button';
import { updateModal } from '@/src/features/location/locationSlice';
import { updateCartAsync } from '@/src/features/cart/cartSlice';

const Product = ({errorCode, productGroup}) => {
  const [halfs, setHalfs] = useState({left: null, right: null});
  const [options, setOptions] = useState([]);
  const [variantIds, setVariantIds] = useState([]);

  const dispatch = useDispatch();
  const {location} = useSelector(state => state.location);

  const {query, locale} = useRouter();
  const { translate } = useTranslation();

  useEffect(() => {
    if (productGroup.options.length) {
      setOptions(productGroup.options.map(option => ''+option.defaultValue));
    }
  }, []);

  useEffect(() => {
    if (!options.length) {
      return;
    }

    const result = [];
    const currentVariantComb = options.map(o => +o);
    const restProductGroup = productGroup.products.filter(p => halfs.left === p.id || halfs.right === p.id);
    for (let product of restProductGroup) {
      const variantCombs = product.variants.map(v => v.options.map(o => o.value.code));  
      const variantIndex = variantCombs.findIndex(vc => {
        if (vc.length !== currentVariantComb.length) return false;
        for (let i=0; i < vc.length; i++) {
            if (vc[i] !== currentVariantComb[i]) return false;
        }
        return true;
      });
      const variant = product.variants[variantIndex !== -1 ? variantIndex : 0];
      result.push(variant.id);
    }

    setVariantIds(result);
  }, [options]);

  const chooseHalf = productId => {
    setHalfs(prevState => {
      if (prevState.left === productId) {
        return {...prevState, left: null};
      }
      if (prevState.right === productId) {
        return {...prevState, right: null};
      }

      if (!prevState.left) {
        return {...prevState, left: productId};
      }
      if (!prevState.right) {
        return {...prevState, right: productId};
      }

      return {...prevState, left: productId, right: null};
    });
  };
  const selectOption = (k, code) => {
    setOptions(prevState => {
      prevState[k] = ''+code;
      return [...options];
    })
  };

  const buy = async (productGroupId=null) => {
    try {
      if (!productGroupId) {
        throw 'Invalid productId';
      }

      if (productGroupId) {
        if (halfs && !halfs.left) {
          throw 'Выберите левую половинку';
        }
        if (halfs && !halfs.right) {
          throw 'Выберите правую половинку';
        }
      }

      const action = 'inc';

      if (!location) {
        dispatch(updateModal({
            toggle: true,
            subjectId: productGroupId,
            subjectType: 'productGroup',
            payload: {productGroupId, action, ...data}
        }));
        return;
      }

      for (let variantId of variantIds) {
        const product = productGroup.products.find(p => p.variants.find(v => variantId === v.id));
        const customIngredientIds = product.customIngredients.map(ingr => ingr.id);

        await dispatch(updateCartAsync({productGroupId, action, variantId, customIngredientIds})).unwrap();
      }
    } catch(e) {
      console.log(e)
      return;
    }
  };

  const leftSideProduct = halfs.left && productGroup.products.find(p => p.id === halfs.left);
  const rightSideProduct = halfs.right && productGroup.products.find(p => p.id === halfs.right);

  if (errorCode) {
    return <Error statusCode={errorCode} />
  }

  return (
    <>
      <Head>
        <title>{`${productGroup.subTitle[locale]} — ${translate('metaTitleProduct')}`}</title>
      </Head>
      <div className={styles.product}>
        <div className={styles.wrapperProductList}>
          <div className={styles.productListTitle}>
            <span className={styles.productListTitleText}>Выберите пиццы для левой и правой половинки</span>
          </div>
          <div className={styles.productList}>
            {productGroup.products.map(p =>
              <div key={p.id} onClick={() => chooseHalf(p.id)} className={styles.wrapperEachProductList}>
                  <ProductViewCardV2 product={p} halfs={halfs} />
              </div>
            )}
          </div>
        </div>
        <div className={styles.wrapperContent}>
          <div className={styles.pizzaImg}>
            <PizzaSVG />
            {leftSideProduct && (
              <div className={styles.leftSideImg}>
                <Image
                  src={leftSideProduct.image.srcWebp}
                  alt={leftSideProduct.image.alt}
                  quality={100}
                  width={leftSideProduct.image.width}
                  height={leftSideProduct.image.height}
                />
              </div>
            )}
            {rightSideProduct && (
              <div className={styles.rightSideImg}>
                <Image
                  src={rightSideProduct.image.srcWebp}
                  alt={rightSideProduct.image.alt}
                  quality={100}
                  width={rightSideProduct.image.width}
                  height={rightSideProduct.image.height}
                />
              </div>
            )}
          </div>
          <div className={styles.halfs}>
            <div className={styles.halfSide}>
              {!leftSideProduct && (
                <>
                  <div className={styles.halfSideImg}><PizzaSmallSVG /></div>
                  <div className={styles.halfSideTitle}>
                    <span>Выберите левую половинку</span>
                  </div>
                </>
              )}
              {leftSideProduct && (
                <>
                  <div className={styles.halfSideImg}>
                    <Image
                      src={leftSideProduct.image.srcWebp}
                      alt={leftSideProduct.image.alt}
                      quality={100}
                      width={leftSideProduct.image.width}
                      height={leftSideProduct.image.height}
                    />
                    <div className={styles.hiddenHalf + ' ' + styles.hiddenHalfRight}></div>
                  </div>
                  <div className={styles.halfSideTitle}>
                    <span>{leftSideProduct.title[locale]}</span>
                  </div>
                </>
              )}
            </div>
            <div className={styles.halfSide}>
              {!rightSideProduct && (
                <>
                  <div className={styles.halfSideImg}><PizzaSmallSVG /></div>
                  <div className={styles.halfSideTitle}>
                    <span>Выберите правую половинку</span>
                  </div>
                </>
              )}
              {rightSideProduct && (
                <>
                  <div className={styles.halfSideImg}>
                    <Image
                      src={rightSideProduct.image.srcWebp}
                      alt={rightSideProduct.image.alt}
                      quality={100}
                      width={rightSideProduct.image.width}
                      height={rightSideProduct.image.height}
                    />
                    <div className={styles.hiddenHalf + ' ' + styles.hiddenHalfLeft}></div>
                  </div>
                  <div className={styles.halfSideTitle}>
                    <span>{rightSideProduct.title[locale]}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {productGroup.options.length > 1 && (
                <div className={styles.options}>
                    {productGroup.options.map((option, k) => (
                      <div key={option.id} className={styles.values}>
                        {option.values.length > 1 && <div className={styles['activeLabel'+(k+1)] + ' ' + styles['shift'+(options[k])]} style={{width: `calc(100% / ${option.values.length})`}}></div>}
                        {option.values.map((value, k2) => (
                          <div key={k2} className={styles.value}>
                            <label onClick={() => selectOption(k, value.code)}>{value.title[locale]}</label>
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
          )}


          <div className={styles.btnBuy}>
            <div className={styles.wrapper}>
                <div className={styles.container}>
                  <Button size='large' primary fullWidth onClick={() => buy(productGroup.id)}>
                    <span>В корзину</span>
                  </Button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const getProductGroupAPI = async (handle, headers) => {
  const res = await fetch(`${process.env.DOMAIN}/api/front/product-group?handle=${handle}`, {
    headers: {
      Cookie: headers.cookie
    }
  });
  const errorCode = res.ok ? false : res.status;
  const data = await res.json();

  return { errorCode, ...data };
};

export async function getServerSideProps(context) {
  const { errorCode, productGroup } = await getProductGroupAPI('halfs', context.req.headers);

  return { props: { errorCode, productGroup } };
}

export default Product