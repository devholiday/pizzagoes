import { useTranslation } from '@/src/common/hooks/useTranslation';
import styles from '@/src/styles/DeliveryInfo.module.css';

export default function DeliveryInfo() {
    const { translate } = useTranslation();

    return (
        <div>
            <ul>
                <li>
                    <div className={styles.line}>
                        <span>{translate('schedule')}</span>
                        <span>17:00 – 23:00</span>
                    </div>
                </li>
                <li>
                    <div className={styles.line}>
                        <span>{translate('averageDeliveryTime')}</span>
                        <span>30 {translate('minutes')}</span>
                    </div>
                </li>
                <li>
                    <div className={styles.line}>
                        <span>{translate('delivery')}</span>
                        <span>&#8362;0</span>
                    </div>
                </li>
            </ul>
        </div> 
    )
}