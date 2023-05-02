import {useEffect, useState, useCallback} from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { createPortal } from 'react-dom';
import styles from '@/src/styles/Navbar.module.css';
import LocaleSwitcherHeader from '@/src/common/components/locale-switcher-header';

import Account from '@/src/features/auth/Auth';
import Location from '@/src/features/location/Location';
import Cart from '@/src/features/cart/Cart';

import { useTranslation } from '@/src/common/hooks/useTranslation';
import Modal from "@/src/common/components/elements/modal";
import Catalogue from "@/src/common/components/catalogue";
import DiscountChanged from "@/src/common/components/modals/discount-changed";

export default function Navbar() {
  const [activeDiscount, setActiveDiscount] = useState(false);
  const {cart} = useSelector(state => state.cart);
  const handleChangeDiscount = useCallback(() => setActiveDiscount(!activeDiscount), [activeDiscount]);
  const { translate } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!cart.discountChanged) return;

    handleChangeDiscount();
}, [cart.discountChanged, dispatch]);

  return (
    <>
      {activeDiscount && createPortal(
        <Modal
            open={activeDiscount}
            onClose={handleChangeDiscount}
            title={translate('discountChanged')}
            primaryAction={{
                onAction: handleChangeDiscount,
                content: translate('ok')
            }}
        >
            <DiscountChanged />
        </Modal>,
        document.body
      )}

      <div className={styles.header}>
        <div className={styles.logoMenu}>
          <Link className={styles.logo} href="/">
            pizzagoes
          </Link>
        </div>

        <div className={styles.address}><Location /></div>

        <div className={styles.buttons}>
          <LocaleSwitcherHeader />
          <Account />
        </div>
      </div>

      <div>
        <Catalogue />
        <Cart />
      </div>
    </>
  )
}