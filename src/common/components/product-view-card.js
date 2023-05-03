import {useState, useCallback} from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from '@/src/common/hooks/useTranslation';
import { createPortal } from 'react-dom';

import styles from '@/src/styles/ProductViewCard.module.css';
import {getPriceFormat} from '@/src/common/utils/currency';
import Button from '@/src/common/components/elements/button';
import Modal from "@/src/common/components/elements/modal";
import Product from './product';

export default function ProductViewCard({product, disabledBuy=false}) {
    const [productId, setProductId] = useState();
    const [activeProduct, setActiveProduct] = useState(false);
    const handleChangeProduct = useCallback(() => setActiveProduct(!activeProduct), [activeProduct]);

    const { locale } = useRouter();
    const {translate} = useTranslation();

    const chooseProduct = productId => {
        setProductId(productId);
        handleChangeProduct();
    };

    return (
        <>
            {activeProduct && createPortal(
                <Modal
                    open={activeProduct}
                    onClose={handleChangeProduct}
                >
                    <div>
                        <Product productId={productId} />
                    </div>
                </Modal>,
                document.body
            )}

            <div className={styles.product}>
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
                        </div>
                        <div className={styles.containerInfo}>
                            <div className={styles.priceTitle}>
                                <div className={styles.priceBlock}>
                                    <span className={styles.price}>от &#8362;{getPriceFormat(product.minPrice)}</span>
                                </div>
                                <h3 className={styles.title}>{product.title[locale]}</h3>
                            </div>
                            {product.ingredients.length > 0 && (
                                <ul className={styles.ingredients}>
                                    {product.ingredients.map((ingredient, i) => (
                                        <li key={i}><div><span>{ingredient.title[locale]}</span></div></li>
                                    ))}
                                </ul>
                            )}
                            <div>
                                {!disabledBuy && <Button onClick={() => chooseProduct(product.id)} disabled={!product.availableForSale} primary>Выбрать</Button>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}