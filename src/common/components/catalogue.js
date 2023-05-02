import {useState, useEffect} from 'react'
import {useRouter} from 'next/router'
import Link from 'next/link'

import styles from '@/src/styles/Catalogue.module.css'
import { useTranslation } from '@/src/common/hooks/useTranslation'

export default function Catalogue() {
    const [catalogue, setCatalogue] = useState([]);
    const { locale } = useRouter();
    const { translate } = useTranslation();

    useEffect(() => {
        async function getCategories() {
            const categories = await getCategoriesAPI();
            setCatalogue(categories);
        }
        getCategories();
    }, []);

    const getCategoriesAPI = async () => {
        const res = await fetch(`/api/front/categories`);
        return await res.json();
    };

    const catalog = catalogue.filter(c => !c.hidden).map((c, i) => (
        <li key={i}>
            <Link href={'/#'+c.handle} scroll={false} className={styles.baseLink}>
                <div className={styles.baseLinkTitle}>{c.title[locale]}</div>
            </Link>
        </li>
    ));

    return (
        <div className={styles.catalogue}>
            <ul className={styles.links}>{catalog}</ul>
        </div>
    );
}