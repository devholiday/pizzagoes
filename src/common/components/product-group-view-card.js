import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import styles from '@/src/styles/ProductViewCard.module.css';
import {getPriceFormat} from '@/src/common/utils/currency';
import BuyButton from '@/src/common/components/buy-button';
import { useTranslation } from '@/src/common/hooks/useTranslation';
import Button from './elements/button';

export default function ProductGroupViewCard({productGroup, disabledBuy=false}) {
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
            <Link href={'/product/' + productGroup.handle} className={styles.link}></Link>
            <div className={styles.wrapper}>
                <div className={styles.container}>
                    <div className={styles.containerImg}>
                        <div className={styles.wrapperImg}>
                            <div className={styles.positionImage}>
                                <div className={styles.image}>
                                    {productGroup.image ? (
                                        <Image
                                            src={productGroup.image.srcWebp}
                                            alt={productGroup.image.alt}
                                            quality={100}
                                            width={productGroup.image.width}
                                            height={productGroup.image.height}
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
                            </div>
                        </div>
                        <div>
                            <h3 className={styles.title}>{productGroup.title[locale]}</h3>
                        </div>
                    </div>
                    <div className={styles.containerInfo}>
                        <div className={styles.price}>
                            &#8362;0
                        </div>
                        <div>
                            <Link href={'/product/' + productGroup.handle}><Button size='small'><span>Собрать</span></Button></Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}