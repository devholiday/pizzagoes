import {useRouter} from 'next/router'
import styles from '@/src/styles/Product.module.css'
import {getPriceFormat} from '@/src/common/utils/currency';
import CheckCircleSVG from '@/public/icons/check-circle';

export default function Ingredients({ingredients=[], selectIngredient, watchIngr}) {
    const { locale } = useRouter();

    const isIngredientById = ingredientId => watchIngr.some(ingrId => ingrId === ingredientId);

    return (
        <div className={styles.ingredients}>
            <div className={styles.containerIngredients}>
                {ingredients.map(ingredient => (
                    <div key={ingredient.id} onClick={() => selectIngredient(ingredient.id)} 
                    className={styles.ingredient + ' ' + styles[isIngredientById(ingredient.id) ? 'activeIngr' : '']}>
                        <div className={styles.checkIcon + ' ' + styles[isIngredientById(ingredient.id) ? 'selectedIcon' : '']}>
                            <CheckCircleSVG fill='#f2790c' width='24px' height='24px' /></div>
                        {ingredient.image && <div className={styles.ingrImg}><img src={ingredient.image.src} /></div>}
                        <div className={styles.ingrTitle}>{ingredient.title[locale]}</div>
                        <div className={styles.ingrPrice}>&#8362;{getPriceFormat(ingredient.price)}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}