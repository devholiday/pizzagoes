import { useSelector, useDispatch } from 'react-redux';

import styles from '@/src/styles/BuyButton.module.css'

import MinusSVG from '@/public/icons/minus'
import PlusSVG from '@/public/icons/plus'
import MinusSmallSVG from '@/public/icons/minus-small'
import PlusSmallSVG from '@/public/icons/plus-small'

import { useTranslation } from '@/src/common/hooks/useTranslation';
import Button from '@/src/common/components/elements/button';

import { updateModal } from '@/src/features/location/locationSlice';
import { updateCartAsync } from '@/src/features/cart/cartSlice';
import SpinnerSVG from '@/public/icons/spinner';

export default function BuyButton({disabled, primary=false, secondary=false, size="medium", productId, data={}, children}) {
    const dispatch = useDispatch();
    const {location} = useSelector(state => state.location);
    const {cart, statusOfUpdate} = useSelector(state => state.cart);

    const { translate } = useTranslation();

    const buy = async (productId, action='inc') => {
        try {
            if (!productId) {
                throw 'Invalid productId';
            }

            if (!location) {
                dispatch(updateModal({
                    toggle: true,
                    subjectId: productId,
                    subjectType: 'product',
                    payload: {productId, action, ...data}
                }));
                return;
            }

            // dispatch(checkDiscountCartAsync());
            dispatch(updateCartAsync({productId, action, ...data}));

            if(statusOfUpdate === 'succeeded') {
                
            }
        } catch(e) {
            return;
        }
    };

    let content = (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <Button onClick={() => buy(productId)} size={size}
                disabled={disabled} secondary={secondary} primary={primary} fullWidth><span>{translate('buy')}</span></Button>
            </div>
        </div>
    );

    const productInCart = cart.products.find(p => p.id === data.cartProductId);
    if (productInCart) {
        content = (
            <div className={styles.wrapper}>
                <div className={styles.container + (size ? ' ' + styles[size] : '')}>
                    <Button onClick={() => buy(productId, 'dec')} secondary>
                        {size !== 'small' ? <MinusSVG /> : <MinusSmallSVG />}</Button>
                    <span className={styles.quantity}>{productInCart.quantity}</span>
                    <Button onClick={() => buy(productId)} secondary>
                        {size !== 'small' ? <PlusSVG /> : <PlusSmallSVG />}
                    </Button>
                </div>
            </div>
        );
    }

    if (children) {
        content = (
            <div className={styles.wrapper}>
                <div className={styles.container}>
                    <Button size={size}
                    disabled={disabled} secondary={secondary} primary={primary} fullWidth><span><SpinnerSVG stroke="#ffffff" /></span></Button>
                </div>
            </div>
        );

        if (statusOfUpdate !== 'loading') {
            content = (
                <div className={styles.wrapper}>
                    <div className={styles.container}>
                        <Button onClick={() => buy(productId)} size={size}
                        disabled={disabled} secondary={secondary} primary={primary} fullWidth><span>{children}</span></Button>
                    </div>
                </div>
            );
        }
    }

    if (disabled) {
       content = (
            <div className={styles.wrapper}>
                <div className={styles.container}>
                    <Button size={size} disabled={disabled} secondary={secondary} fullWidth><span>{translate('notAvailable')}</span></Button>
                </div>
            </div>
       );
    }

    return (
        <>
            {content}
        </>
    );
}