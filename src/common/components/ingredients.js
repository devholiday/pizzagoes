import {useRouter} from 'next/router'
import styles from '@/src/styles/Product.module.css'
import {getPriceFormat} from '@/src/common/utils/currency';
import CheckCircleSVG from '@/public/icons/check-circle';

export default function Ingredients({ingredients=[], selectIngredient, watchIngr, denyIds=[]}) {
    const { locale } = useRouter();

    const isIngredientById = ingredientId => watchIngr.some(ingrId => ingrId === ingredientId);

    const ingrsJSX = ingredients.map(ingr => {
        let classNameIcon = styles.checkIcon;
        let className = styles.ingredient;
        if (isIngredientById(ingr.id)) {
            className += ' ' + styles.activeIngr;
            classNameIcon += ' ' + styles.selectedIcon;
        }
        if (denyIds.includes(ingr.id)) {
            className += ' ' + styles.disabledIngr;
        }

        return (
            <div key={ingr.id} onClick={() => selectIngredient(ingr.id)} className={className}>
                {!denyIds.includes(ingr.id) && (
                    <div className={classNameIcon}>
                        <CheckCircleSVG fill='#f2790c' width='24px' height='24px' />
                    </div>
                )}
                <img src={ingr.image.src} className={styles.ingrImg} />
                <div className={styles.ingrTitle}>{ingr.title[locale]}</div>
                <div className={styles.ingrPrice}>&#8362;{getPriceFormat(ingr.price)}</div>
            </div>
        );
    });

    return (
        <div className={styles.ingredients}>
            <section className={styles.containerIngredients}>
                {ingrsJSX}
            </section>
        </div>
    )
}