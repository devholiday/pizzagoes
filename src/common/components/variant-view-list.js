import Image from 'next/image';
import BuyButton from '@/src/common/components/buy-button';
import {useRouter} from 'next/router';

import {getPriceFormat} from '@/src/common/utils/currency';
import styles from '@/src/styles/VariantViewList.module.css';

export default function VariantViewList({variant, disabledBuy=false}) {
    const { locale } = useRouter();

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
                    </div>
                    {variant.options.length > 1 && (
                        <div className={styles.optionsString}>
                            <span>{variant.options.map(option => option.value.subTitle[locale]).join(', ')}</span>
                        </div>
                    )}
                    <div className={styles.ingredients}>
                        {variant.ingredients.length > 0 && (
                            <span>+ {variant.ingredients.map(ingr => ingr.title[locale]).join(', ')}</span>
                        )}
                        {variant.excludeCustomIngredients.length > 0 && (
                            <span>− {variant.excludeCustomIngredients.map(ingr => ingr.title[locale]).join(', ')}</span>
                        )}
                    </div>
                </div>
            </div>
            <div className={styles.quantityBlock}>
                <BuyButton disabled={!variant.availableForSale} size='small' 
                    productGroupId={variant.productGroupId} 
                    productId={variant.productId} 
                    data={{cartProductId: variant.cartProductId, variantId: variant.id, variantIds: variant.variantIds, 
                        ingredientIds: variant.ingredientIds}} />
            </div>
        </div>
    );
}