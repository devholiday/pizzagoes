import Head from 'next/head';
import {useRouter} from 'next/router'

import { useTranslation } from '@/src/common/hooks/useTranslation';
import styles from '@/src/styles/Home.module.css'
import Alerts from '@/src/common/components/alerts';
import ProductViewCard from '@/src/common/components/product-view-card';
import ProductGroupViewCard from '@/src/common/components/product-group-view-card';

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
        <Alerts />
        {linksWithProducts?.map((linkWithProducts, i) => (
          <section key={i} className={styles.section}>
            <h2 id={linkWithProducts.handle} className={styles.sectionTitle}>{linkWithProducts.title[locale]}</h2>

            <div className={styles.products}>
              {linkWithProducts.productGroups.map(p => <div key={p.id} className={styles.productWrapper}><ProductGroupViewCard productGroup={p}/></div>)}
              {linkWithProducts.products.map(p => <div key={p.id} className={styles.productWrapper}><ProductViewCard product={p}/></div>)}
            </div>
          </section>
        ))}
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