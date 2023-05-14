import Image from 'next/image';
import {useRouter} from 'next/router';
import styles from '@/src/styles/LineItemViewList.module.css';
import {getPriceFormat} from '@/src/common/utils/currency';

export default function LineItemViewList({lineItem}) {
    const { locale } = useRouter();

    return (
        <div className={styles.product}>
            <div className={styles.image}>
                {lineItem.image ? (
                    <Image
                        src={lineItem.image.srcWebp}
                        alt={lineItem.image.alt}
                        quality={100}
                        width={lineItem.image.width}
                        height={lineItem.image.height}
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
            <div className={styles.info}>
                <div className={styles.title}><h3>{lineItem.title[locale]}</h3></div>
                <div>
                    <span className={styles.price}>&#8362;{getPriceFormat(lineItem.price)}</span>
                    <span> · </span>
                    <span className={styles.weight}>{lineItem.displayAmount} {lineItem.unit}</span>
                </div>
                {lineItem.options.length > 1 && (
                        <div className={styles.optionsString}>
                            <span>{lineItem.options.map(option => option.value.subTitle[locale]).join(', ')}</span>
                        </div>
                )}
                <div className={styles.ingredients}>
                    {lineItem.customIngredients.length > 0 && (
                        <span>{lineItem.customIngredients.map(ingr => ingr.title[locale]).join(', ')}</span>
                    )}
                    {lineItem.ingredients.length > 0 && (
                        <span>+ {lineItem.ingredients.map(ingr => ingr.title[locale]).join(', ')}</span>
                    )}
                </div>
            </div>
            <div className={styles.quantityBlock}>
                <div className={styles.quantity}>
                    <span>× {lineItem.quantity}</span>
                </div>
            </div>
        </div>
    );
}