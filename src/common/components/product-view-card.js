import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import styles from '@/src/styles/ProductViewCard.module.css';
import {getPriceFormat} from '@/src/common/utils/currency';
import BuyButton from '@/src/common/components/buy-button';
import { useTranslation } from '@/src/common/hooks/useTranslation';
import Button from './elements/button';

export default function ProductViewCard({product, disabledBuy=false}) {
    const { locale } = useRouter();
    const {cart} = useSelector(state => state.cart);
    const {translate} = useTranslation();

    const getCartProduct = variantId => {
        if (!cart.variantsV2) {
            return null;
        }
        const p = cart.variantsV2.find(p => p.id === variantId);
        if (!p) {
            return null;
        };
        return p.cartProductId;
    };

    return (
        <div className={styles.product}>
            <Link href={'/product/' + product.id} className={styles.link}></Link>
            <div className={styles.wrapper}>
                <div className={styles.container}>
                    <div className={styles.containerImg}>
                        <div className={styles.wrapperImg}>
                            <div className={styles.positionImage}>
                                <div className={styles.image}>
                                    {product.image ? (
                                        <Image
                                            src={product.image.srcWebp}
                                            alt={product.image.alt}
                                            quality={100}
                                            width={product.image.width}
                                            height={product.image.height}
                                        />
                                    )                                    
                                    : (
                                        <Image
                                            src={'/images/placeholder.svg'}
                                            alt={'placeholder'}
                                            width={111}
                                            height={111}
                                        />
                                    )}
                                </div>
                                {product.labels.length > 0 && (
                                    <ul className={styles.labels}>
                                        {product.labels.map((label, i) => (
                                            <li key={i}><div><span>{label[locale]}</span></div></li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className={styles.title}>{product.title[locale]}</h3>

                            {product.customIngredients.length > 0 && (
                                <div className={styles.customIngredients}>
                                    {product.customIngredients.map(ingr => ingr.title[locale]).join(', ')}
                                </div>
                            )}

                            {product.variants.length === 1 && 
                                <div className={styles.weightInfo}>{product.variant.displayAmount} {translate(product.variant.unit)}</div>}
                        </div>
                    </div>
                    <div className={styles.containerInfo}>
                        <div className={styles.price}>
                            {product.variants.length > 1 && translate('from') + ' ' }
                            &#8362;{getPriceFormat(product.minPrice)}
                        </div>
                        <div>
                            {product.variants.length > 1 ? <Link href={'/product/' + product.id}><Button size='small'><span>{translate('choose')}</span></Button></Link> :
                                <BuyButton disabled={!product.variant.availableForSale} size='small' 
                                    productId={product.variant.productId} 
                                    data={{cartProductId: getCartProduct(product.variant.id), variantId: product.variant.id}}
                                />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}