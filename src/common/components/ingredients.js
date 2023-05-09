import {useRouter} from 'next/router'
import styles from '@/src/styles/Product.module.css'
import {getPriceFormat} from '@/src/common/utils/currency';

export default function Ingredients({ingredients=[], selectIngredient, watchIngr}) {
    const { locale } = useRouter();

    const isIngredientById = ingredientId => watchIngr.some(ingrId => ingrId === ingredientId);

    return (
        <div className={styles.ingredients}>
            <div className={styles.containerIngredients}>
                {ingredients.map(ingredient => (
                    <div key={ingredient.id} onClick={() => selectIngredient(ingredient.id)} 
                    className={styles.ingredient + ' ' + styles[isIngredientById(ingredient.id) ? 'activeIngr' : '']}>
                        {ingredient.image && <div className={styles.ingrImg}><img src={ingredient.image.src} /></div>}
                        <div className={styles.ingrTitle}>{ingredient.title[locale]}</div>
                        <div className={styles.ingrPrice}>&#8362;{getPriceFormat(ingredient.price)}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}