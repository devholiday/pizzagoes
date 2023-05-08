import Link from 'next/link';
import styles from '@/src/styles/Footer.module.css';
import { useTranslation } from '@/src/common/hooks/useTranslation';
import FacebookSVG from '@/public/icons/facebook';
import InstagramSVG from '@/public/icons/instagram';

export default function Footer() {
  const {translate} = useTranslation();

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.top}>
          <Link href="/">
            PizzaGoes
          </Link>
        </div>
        <div className={styles.bottom}>
          <div className={styles.info}>
            <span className={styles.infoAboutDelivery}>{translate('infoAboutDelivery')}</span>
            <span className={styles.links}>
              &copy; {new Date().getFullYear()} PizzaGoes
            </span>
          </div>
          <div className={styles.socialsWrapper}>
            <div className={styles.socials}>
              <a target="_blank" href="https://www.facebook.com/pizzagoes.deli/" rel="noopener noreferrer">
                <FacebookSVG fill="#9e9b98" />
              </a>
              <a target="_blank" href="https://www.instagram.com/pizzagoes.deli/" rel="noopener noreferrer">
                <InstagramSVG fill="#9e9b98" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}