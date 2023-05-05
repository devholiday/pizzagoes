import Image from 'next/image';
import BuyButton from '@/src/common/components/buy-button';
import {useRouter} from 'next/router';

import {getPriceFormat} from '@/src/common/utils/currency';
import styles from '@/src/styles/VariantViewList.module.css';

export default function VariantViewList({variant, disabledBuy=false}) {
    const { locale } = useRouter();

    const getOptionsString = (options=[]) => options.map(option => option.value.subTitle[locale]).join(', ');

    return (
        <div className={styles.product}>
            <div className={styles.info}>
                <div className={styles.image}>
                    {variant.image ? (
                        <Image
                            src={variant.image.srcWebp}
                            alt={variant.image.alt}
                            quality={100}
                            width={variant.image.width}
                            height={variant.image.height}
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
                <div className={styles.titlePriceWeight}>
                    <div className={styles.title}><h3>{variant.title[locale]}</h3></div>
                    <div className={styles.priceBlock}>
                        <span className={styles.price}>&#8362;{getPriceFormat(variant.price)}</span>
                        <span className={styles.weight}> · {variant.displayAmount} {variant.unit}</span>
                    </div>
                    <div className={styles.optionsString}>
                        <span>{getOptionsString(variant.options)}</span>
                    </div>
                    {variant.ingredients.length > 0 && (
                        <div className={styles.ingredientsProduct}>
                            {variant.ingredients.map(i => i.title[locale]).join(', ')}
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.quantityBlock}>
                {!disabledBuy && <BuyButton disabled={!variant.availableForSale} size='small' 
                productId={variant.productId} 
                data={{cartProductId: variant.cartProductId, variantId: variant.id, ingredientIds: variant.ingredientIds}} />}
                {disabledBuy && (
                    <div className={styles.quantity}><span>{variant.quantity}</span></div>
                )}
            </div>
        </div>
    );
}