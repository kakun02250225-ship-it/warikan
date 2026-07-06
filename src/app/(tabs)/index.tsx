import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Segmented } from '@/components/Segmented';
import { CalendarView } from '@/features/kakeibo/CalendarView';
import { ChartView } from '@/features/kakeibo/ChartView';
import { RecordForm } from '@/features/kakeibo/RecordForm';
import { colors } from '@/lib/theme';

type View_ = 'input' | 'calendar' | 'chart';

export default function KakeiboScreen() {
  const [view, setView] = useState<View_>('input');

  return (
    <View style={styles.container}>
      <View style={styles.switcher}>
        <Segmented<View_>
          options={[
            { key: 'input', label: '入力' },
            { key: 'calendar', label: 'カレンダー' },
            { key: 'chart', label: 'グラフ' },
          ]}
          value={view}
          onChange={setView}
        />
      </View>
      {view === 'input' && <RecordForm />}
      {view === 'calendar' && <CalendarView />}
      {view === 'chart' && <ChartView />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  switcher: { paddingHorizontal: 16, paddingTop: 12 },
});
