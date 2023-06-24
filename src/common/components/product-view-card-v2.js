import Image from 'next/image';
import { useRouter } from 'next/router';

import styles from '@/src/styles/ProductViewCardV2.module.css';
import {getPriceFormat} from '@/src/common/utils/currency';

export default function ProductViewCardV2({product, halfs=[]}) {
    const { locale } = useRouter();

    return (
        <div className={halfs.left === product.id || halfs.right === product.id ? styles.product + ' ' + styles.active : styles.product}>
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
                {halfs.left === product.id && <div className={styles.hiddenHalf + ' ' + styles.hiddenHalfRight}></div>}
                {halfs.right === product.id && <div className={styles.hiddenHalf + ' ' + styles.hiddenHalfLeft}></div>}
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{product.title[locale]}</h3>
                <div className={styles.price}>&#8362;{getPriceFormat(product.minPrice)}</div>
            </div>
        </div>
    );
}