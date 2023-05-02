import Head from 'next/head';
import {useRouter} from 'next/router'

import { useTranslation } from '@/src/common/hooks/useTranslation';
import styles from '@/src/styles/Home.module.css'
import Catalog from '@/src/common/components/catalog';
import Alerts from '@/src//common/components/alerts';

export default function Home({linksWithProducts}) {
  const {translate} = useTranslation();
  const { locale } = useRouter();

  return (
    <>
      <Head>
        <title>{translate('metaTitleHome')}</title>
        <meta name="description" content={translate('metaDescriptionHome')} />
      </Head>
      <div className={styles.wrapper}>
        <div className={styles.main}>
          <Alerts />
          {linksWithProducts?.map((linkWithProducts, i) => (
            <div key={i} className={styles.section}>
              <h2 id={linkWithProducts.handle} className={styles.sectionTitle}>{linkWithProducts.title[locale]}</h2>

              <div><Catalog products={linkWithProducts.products}/></div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

const getProductsAPI = async (headers) => {
  const res = await fetch(`${process.env.DOMAIN}/api/front/categories-with-products`, {
    headers: {
      Cookie: headers.cookie
    }
  });
  return await res.json();
};

export async function getServerSideProps(context) {
  const linksWithProducts = await getProductsAPI(context.req.headers);

  return { props: { linksWithProducts } };
}