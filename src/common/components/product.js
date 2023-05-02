import {useState, useEffect} from 'react'
import {useRouter} from 'next/router'

import styles from '@/src/styles/Product.module.css'
import { useTranslation } from '@/src/common/hooks/useTranslation'

export default function Product({productId}) {
    const [product, setProduct] = useState();
    const { locale } = useRouter();
    const { translate } = useTranslation();

    useEffect(() => {
        async function getProduct() {
            const {product} = await getProductAPI(productId);
            setProduct(product);
        }
        getProduct();
    }, []);

    const getProductAPI = async productId => {
        const res = await fetch(`/api/front/product?productId=${productId}`);
        const errorCode = res.ok ? false : res.status;
        const data = await res.json();
      
        return { errorCode, ...data };
    };

    if (!product) {
        return <></>
    }

    return (
        <div className={styles.product}>
            <div className={styles.images}></div>
            <div className={styles.content}>
                <div>
                    {product.subTitle[locale]}
                </div>
                {product.ingredients.length > 0 && (
                    <ul className={styles.ingredients}>
                        {product.ingredients.map((ingredient, i) => (
                            <li key={i}><div><span>{ingredient.title[locale]}</span></div></li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}