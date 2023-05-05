import {useState, useEffect} from 'react'
import { useRouter } from 'next/router'
import Error from '../_error'
import Image from 'next/image';
import Link from 'next/link'
import Head from 'next/head'
import styles from '@/src/styles/Product.module.css'
import { useTranslation } from '@/src/common/hooks/useTranslation';
import BuyButton from '@/src/common/components/buy-button';
import {getPriceFormat} from '@/src/common/utils/currency';
import Ingredients from '@/src/common/components/ingredients'

const Product = ({errorCode, product}) => {
  const [variant, setVariant] = useState();
  const [ingredients, setIngredients] = useState([]);
  const [ingredientIds, setIngredientIds] = useState([]);
  const [options, setOptions] = useState([]);
  const [price, setPrice] = useState(0);
  
  const {query, locale} = useRouter();
  const { translate } = useTranslation();

  const { productId } = query;

  useEffect(() => {
    if (product.options.length) {
      setOptions(product.options.map(option => ''+option.defaultValue));
    }
  }, []);

  useEffect(() => {
    if (!options.length) {
      return;
    }

    const currentVariantComb = options.map(o => +o);
    const variantCombs = product.variants.map(v => v.options.map(o => o.value.code));
    const variantIndex = variantCombs.findIndex(vc => {
        if (vc.length !== currentVariantComb.length) return false;
        for (let i=0; i < vc.length; i++) {
            if (vc[i] !== currentVariantComb[i]) return false;
        }
        return true;
    });

    const variant = product.variants[variantIndex !== -1 ? variantIndex : 0];
    if (variantIndex === -1) {
        setOptions(variant.options.map(o => ''+o.value.code));
    } else {
        const ingredients = product.ingredients.map(ingr => ({...ingr, price: ingr.price + variant.ingredients.priceInc}));
        setIngredients(ingredients);

        const totalPriceIngr = ingredients.reduce((acc, ingr) => {
            if (ingredientIds.includes(ingr.id)){
                acc += ingr.price;
            }
            return acc;
        }, 0);

        setVariant(variant);
        setPrice(variant.price + totalPriceIngr)
    }
  }, [options]);

  const getOptionsString = (options=[]) => options.map(option => option.value.subTitle[locale]).join(', ');
  const getClassNameOfOptionPizza = (classname, option) => classname+option.value.code;

  const selectOption = (k, code) => {
      setOptions(prevState => {
        prevState[k] = ''+code;
        return [...options];
      })
  };

  const selectIngredient = ingredientId => {
      const ingredient = ingredients.find(ingr => ingr.id === ingredientId);

      if (ingredientIds.includes(ingredientId)) {
          setIngredientIds(ingredientIds.filter(id => id !== ingredientId));     
          setPrice(prevState => prevState - ingredient.price)
          return;
      }

      setIngredientIds([...ingredientIds, ingredientId]);
      setPrice(prevState => prevState + ingredient.price)
  };

  if (errorCode) {
    return <Error statusCode={errorCode} />
  }

  if (!variant) return <></>;

  return (
    <>
      <Head>
        <title>{`${product.subTitle[locale]} — ${translate('metaTitleProduct')}`}</title>
      </Head>
      <div className={styles.wrapper}>
        <div className='topBar'>
          <div className='breadcrumbs'>
            <Link href="/">{translate('breadcrumbsHome')}</Link>
          </div>
          <div>
            {product.labels.length > 0 && (
                <ul className={styles.labels}>
                    {product.labels.map((label, i) => (
                        <li key={i}><div><span>{label[locale]}</span></div></li>
                    ))}
                </ul>
            )}
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.product}>
            <div className={styles.images}>
              <div className={styles.imagesWrapper + ' ' + styles[getClassNameOfOptionPizza('size', variant?.options[0])]}>
                 <Image
                  src={variant.image.srcWebp}
                  alt={variant.image.alt}
                  quality={100}
                  width={variant.image.width}
                  height={variant.image.height}
                  priority={true}
                />
              </div>
               
            </div>
            <div>
                <div>
                    <div className={styles.form}>
                        <div className={styles.content}>
                            <div className={styles.contentScroll}>
                                <h1 className={styles.heading}>{product.subTitle[locale]}</h1>
                                <div className={styles.optionsString}>
                                    <span>{getOptionsString(variant?.options)} {variant?.displayAmount} {translate(variant?.unit)}</span>
                                </div>
                                {product.ingredientsProduct.length > 0 && (
                                    <div className={styles.ingredientsProduct}>
                                        {product.ingredientsProduct.map(i => i.title[locale]).join(', ')}
                                    </div>
                                )}
                                {product.options.length > 0 && (
                                    <div className={styles.options}>
                                        {product.options.map((option, k) => (
                                            <div key={option.id} className={styles.values}>
                                                <div className={styles['activeLabel'+(k+1)] + ' ' + styles['shift'+(options[k])]}></div>
                                                {option.values.map((value, k2) => (
                                                    <div key={k2} className={styles.value}>
                                                        <label onClick={() => selectOption(k, value.code)}>{value.title[locale]}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {product.ingredients && 
                                    <Ingredients ingredients={ingredients} selectIngredient={selectIngredient} watchIngr={ingredientIds} />
                                }
                            </div>
                        </div>
                        <div className={styles.btnBuy}>
                            <BuyButton productId={productId} data={{variantId: variant.id, ingredientIds}} primary>Добавить в корзину за &#8362;{getPriceFormat(price)}</BuyButton>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const getProductAPI = async (productId, headers) => {
  const res = await fetch(`${process.env.DOMAIN}/api/front/product?productId=${productId}`, {
    headers: {
      Cookie: headers.cookie
    }
  });
  const errorCode = res.ok ? false : res.status;
  const data = await res.json();

  return { errorCode, ...data };
};

export async function getServerSideProps(context) {
  const {productId} = context.params;

  const { errorCode, product } = await getProductAPI(productId, context.req.headers);

  return { props: { errorCode, product } };
}

export default Product