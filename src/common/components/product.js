import {useState, useEffect} from 'react'
import {useRouter} from 'next/router'
import { useForm } from "react-hook-form"

import styles from '@/src/styles/Product.module.css'
import { useTranslation } from '@/src/common/hooks/useTranslation'
import Button from '@/src/common/components/elements/button'
import Ingredients from '@/src/common/components/ingredients'

export default function Product({productId}) {
    const [product, setProduct] = useState();
    const [variant, setVariant] = useState();
    const [ingredients, setIngredients] = useState([]);
    const { locale } = useRouter();
    const { translate } = useTranslation();

    const { handleSubmit, getValues, setValue, watch } = useForm({
        defaultValues: {
            price: 0,
            options: [],
            ingredients: []
        }
    });

    useEffect(() => {
        async function getProduct() {
            const {product} = await getProductAPI(productId);
            setProduct(product);

            if (product.options.length) {
                setValue('options', product.options.map(option => ''+option.defaultValue));
            }
        }
        getProduct();
    }, []);

    useEffect(() => {
        if (!product) {
            return;
        }

        const subscription = watch((value, { name, type }) => {
            if (name && name.startsWith('options') && (!type || type === 'change')) {
                const options = value.options.map(o => +o);
                const currentVariantComb = options;
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
                    const variantComb = variant.options.map(o => ''+o.value.code);
                    setValue('options', variantComb);
                } else {
                    const ingredients = product.ingredients.map(ingr => ({...ingr, price: ingr.price + variant.ingredients.priceInc}));
                    setIngredients(ingredients);

                    const totalPriceIngr = ingredients.reduce((acc, ingr) => {
                        if (getValues('ingredients').includes(ingr.id)){
                            acc += ingr.price;
                        }
                        return acc;
                    }, 0);

                    setVariant(variant);                                
                    setValue('price', variant.price + totalPriceIngr);
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, product]);

    const getProductAPI = async productId => {
        const res = await fetch(`/api/front/product?productId=${productId}`);
        const errorCode = res.ok ? false : res.status;
        const data = await res.json();
      
        return { errorCode, ...data };
    };

    const onSubmit = data => {
        console.log(data);
    }

    const getOptionsString = (options=[]) => options.map(option => option.value.subTitle[locale]).join(', ');
    const getClassNameOfOptionPizza = (classname, option) => classname+option.value.code;

    const selectOption = (k, code) => {
        setValue('options.'+k, code);
    };

    const selectIngredient = ingredientId => {
        const ingredientIds = getValues('ingredients');
        const ingredient = ingredients.find(ingr => ingr.id === ingredientId);

        if (ingredientIds.includes(ingredientId)) {
            setValue('ingredients', ingredientIds.filter(id => id !== ingredientId));        
            setValue('price', getValues('price') - ingredient.price);
            return;
        }

        setValue('ingredients', [...ingredientIds, ingredientId]);
        setValue('price', getValues('price') + ingredient.price);
    };

    if (!product || !variant) {
        return <></>;
    }

    return (
        <div className={styles.product}>
            <div className={styles.images + ' ' + styles[getClassNameOfOptionPizza('size', variant?.options[0])]}>
                <img src={variant.image.srcWebp} />
            </div>
            <div>
                <div>
                    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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
                                                <div className={styles['activeLabel'+(k+1)] + ' ' + styles['shift'+(getValues('options.'+k))]}></div>
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
                                    <Ingredients ingredients={ingredients} selectIngredient={selectIngredient} watchIngr={watch('ingredients')} />
                                }
                            </div>
                        </div>
                        <div className={styles.btnBuy}>
                            <Button submit primary fullWidth>Добавить в корзину за &#8362;{getValues('price')}</Button>
                        </div>
                    </form>
                </div>
                
            </div>
        </div>
    );
}