import Link from 'next/link';
import styles from '@/src/styles/Footer.module.css';
import { useTranslation } from '@/src/common/hooks/useTranslation';
import FacebookSVG from '@/public/icons/facebook';
import InstagramSVG from '@/public/icons/instagram';
import WhatsAppSVG from '@/public/icons/whatsapp';
import LogoGraySVG from '@/public/icons/logo-gray';

export default function Footer() {
  const {translate} = useTranslation();

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.top}>
          <Link href="/">
            <LogoGraySVG />
          </Link>
        </div>
        <div className={styles.bottom}>
          <div className={styles.info}>
            <span className={styles.infoAboutDelivery}>{translate('infoAboutDelivery')}</span>
            <span className={styles.infoAboutProducts}>{translate('infoAboutProducts')}</span>
            <span className={styles.links}>
              &copy; {new Date().getFullYear()} PizzaGoes
            </span>
          </div>
          <div className={styles.socialsWrapper}>
            <div className={styles.socials}>
              <a target="_blank" href={"https://www.facebook.com/"+process.env.NEXT_PUBLIC_FB_LINK} rel="noopener noreferrer">
                <FacebookSVG fill="#9e9b98" />
              </a>
              <a target="_blank" href={"https://www.instagram.com/"+process.env.NEXT_PUBLIC_INSTAGRAM_LINK} rel="noopener noreferrer">
                <InstagramSVG fill="#9e9b98" />
              </a>
              <a target="_blank" href={"https://wa.me/message/"+process.env.NEXT_PUBLIC_WHATSAPP_LINK} rel="noopener noreferrer">
                <WhatsAppSVG fill="#9e9b98" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}