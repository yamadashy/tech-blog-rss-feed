import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

/**
 * `_data` のロジックで共通利用する dayjs のセットアップ。
 *
 * 元々各 `_data/*.js` が個別に行っていた `extend` / `locale` / `tz.setDefault` を
 * 1 箇所に集約したもの。dayjs はグローバルにプラグインを登録するため、
 * このモジュールを import した時点で設定が有効になる（副作用として一度だけ実行される）。
 */
dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.locale('ja');
dayjs.tz.setDefault('Asia/Tokyo');

export { dayjs };
export type { Dayjs } from 'dayjs';
