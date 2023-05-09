import {useEffect, useState, useCallback} from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { createPortal } from 'react-dom';
import styles from '@/src/styles/Navbar.module.css';
import LocaleSwitcherHeader from '@/src/common/components/locale-switcher-header';

import Account from '@/src/features/auth/Auth';
import Location from '@/src/features/location/Location';
import Cart from '@/src/features/cart/Cart';

import { updateModal, getModal } from '@/src/features/location/locationSlice';

import { useTranslation } from '@/src/common/hooks/useTranslation';
import Modal from "@/src/common/components/elements/modal";
import Catalogue from "@/src/common/components/catalogue";
import DiscountChanged from "@/src/common/components/modals/discount-changed";
import Address from "@/src/common/components/modals/address";

import LogoSVG from '@/public/icons/logo';

export default function Navbar() {
  const [activeDiscount, setActiveDiscount] = useState(false);
  const [activeAddress, setActiveAddress] = useState(false);

  const {cart} = useSelector(state => state.cart);
  const locationModal = useSelector(getModal);

  const handleChangeDiscount = useCallback(() => setActiveDiscount(!activeDiscount), [activeDiscount]);
  const handleChangeAddress = useCallback(() => setActiveAddress(!activeAddress), [activeAddress]);

  const { translate } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!cart.discountChanged) return;

      handleChangeDiscount();
  }, [cart.discountChanged, dispatch]);

  useEffect(() => {
    if (!locationModal || !locationModal.toggle) return;

    handleChangeAddress();
  }, [locationModal, dispatch]);

  const handleClose = () => {
    handleChangeAddress();
    dispatch(updateModal(null));
  };

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
      {activeAddress && createPortal(
          <Modal
              open={activeAddress}
              onClose={handleClose}
              title={translate('enterYourDeliveryAddress')}
          >
              <Address onClose={handleClose} />
          </Modal>,
          document.body
      )}

      <div className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.logoWrapper}>
            <Link className={styles.logo} href="/">
              <LogoSVG />
            </Link>
          </div>

          <div className={styles.buttons}>
            <Cart />
            <LocaleSwitcherHeader />
            <Account />
          </div>
        </div>
        <div className={styles.menuContainer}>
          <Catalogue />
          <Location />
        </div>
      </div>
    </>
  )
}