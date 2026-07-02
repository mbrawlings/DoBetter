import * as React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Icon, Text } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useQuery } from '@apollo/client';
import { BackButton, NavBar, SectionLabel } from '../components/ui';
import { PERSONS_QUERY } from '../graphql/operations';
import { colorsLight, fontFamily, radius, shadows } from '../theme/theme';
import { formatDateYmd } from '../utils/date';
import {
  buildAgenda,
  buildCalendarItems,
  buildMarkedDates,
  groupByDay,
  KIND_COLORS,
  KIND_ICONS,
  type CalendarItem,
  type CalendarPerson,
} from '../utils/calendar';

type CalendarView = 'month' | 'agenda';

const AGENDA_DAYS = 90;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dateFromYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDayHeading(ymd: string, todayYmd: string): string {
  const date = dateFromYmd(ymd);
  const label = `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
  if (ymd === todayYmd) return `Today · ${label}`;
  return label;
}

function timeLabel(item: CalendarItem): string {
  if (!item.startsAt) return '';
  const d = new Date(item.startsAt);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

const calendarTheme = {
  calendarBackground: colorsLight.bg,
  textSectionTitleColor: colorsLight.textMuted,
  dayTextColor: colorsLight.text,
  monthTextColor: colorsLight.text,
  textDisabledColor: colorsLight.textFaint,
  selectedDayBackgroundColor: colorsLight.primary,
  selectedDayTextColor: colorsLight.primaryFg,
  todayTextColor: colorsLight.primary,
  arrowColor: colorsLight.primary,
  textDayFontFamily: fontFamily.medium,
  textMonthFontFamily: fontFamily.semibold,
  textDayHeaderFontFamily: fontFamily.medium,
  textDayFontSize: 15,
  textMonthFontSize: 17,
  textDayHeaderFontSize: 12,
};

export default function CalendarScreen({ navigation }: any) {
  const nav = useNavigation();
  const { data, loading, refetch } = useQuery(PERSONS_QUERY, {
    variables: { filter: null },
    fetchPolicy: 'cache-and-network',
  });

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const persons: CalendarPerson[] = data?.persons ?? [];
  const todayYmd = React.useMemo(() => formatDateYmd(new Date()), []);

  const [view, setView] = React.useState<CalendarView>('month');
  const [visibleYear, setVisibleYear] = React.useState(() => new Date().getFullYear());
  const [selectedYmd, setSelectedYmd] = React.useState(todayYmd);

  const monthItems = React.useMemo(
    () => buildCalendarItems(persons, visibleYear),
    [persons, visibleYear],
  );
  const markedDates = React.useMemo(
    () => buildMarkedDates(monthItems, selectedYmd),
    [monthItems, selectedYmd],
  );
  const selectedItems = React.useMemo(
    () => groupByDay(monthItems)[selectedYmd] ?? [],
    [monthItems, selectedYmd],
  );

  const agenda = React.useMemo(() => {
    const items = buildCalendarItems(persons, new Date().getFullYear());
    return buildAgenda(items, new Date(), AGENDA_DAYS);
  }, [persons]);

  function goToPerson(personId: string) {
    (nav as any).navigate('PersonHub', { id: personId });
  }

  const showInitialLoading = loading && persons.length === 0;

  return (
    <View style={styles.screen}>
      <NavBar
        title="Calendar"
        leading={<BackButton onPress={() => navigation.goBack()} />}
        trailing={<SegmentedToggle value={view} onChange={setView} />}
      />
      {showInitialLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colorsLight.primary} />
        </View>
      ) : view === 'month' ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.calendarCard}>
            <Calendar
              current={`${selectedYmd}`}
              markingType="multi-dot"
              markedDates={markedDates}
              onDayPress={(day: { dateString: string }) => setSelectedYmd(day.dateString)}
              onMonthChange={(m: { year: number }) => setVisibleYear(m.year)}
              theme={calendarTheme as any}
              style={styles.calendar}
            />
          </View>
          <SectionLabel>{formatDayHeading(selectedYmd, todayYmd)}</SectionLabel>
          {selectedItems.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nothing scheduled.</Text>
            </View>
          ) : (
            <View style={styles.stack}>
              {selectedItems.map((item) => (
                <DayItemRow key={item.id} item={item} onPress={() => goToPerson(item.personId)} />
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {agenda.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nothing in the next {AGENDA_DAYS} days.</Text>
            </View>
          ) : (
            agenda.map((group) => (
              <View key={group.ymd}>
                <SectionLabel>{formatDayHeading(group.ymd, todayYmd)}</SectionLabel>
                <View style={styles.stack}>
                  {group.items.map((item) => (
                    <DayItemRow
                      key={item.id}
                      item={item}
                      onPress={() => goToPerson(item.personId)}
                    />
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

function SegmentedToggle({
  value,
  onChange,
}: {
  value: CalendarView;
  onChange: (v: CalendarView) => void;
}) {
  return (
    <View style={styles.segment}>
      {(['month', 'agenda'] as const).map((option) => {
        const active = value === option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.segmentButton, active && styles.segmentButtonActive]}
            accessibilityLabel={option === 'month' ? 'Month view' : 'Agenda view'}
          >
            <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
              {option === 'month' ? 'Month' : 'Agenda'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function DayItemRow({ item, onPress }: { item: CalendarItem; onPress: () => void }) {
  // Birthday/anniversary titles already contain the person's name; events don't,
  // so surface who it belongs to in the subtitle for the global calendar view.
  const who = item.kind === 'event' ? item.personName : '';
  const subtitleParts = [who, timeLabel(item), item.notes].filter(Boolean);
  const subtitle = subtitleParts.join(' · ');
  const tint = KIND_COLORS[item.kind];
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={[styles.iconBlock, { backgroundColor: colorsLight.raised }]}>
        <Icon source={KIND_ICONS[item.kind]} size={20} color={tint} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Icon source="chevron-right" size={16} color={colorsLight.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colorsLight.bg,
  },
  scroll: {
    paddingBottom: 60,
  },
  center: {
    paddingTop: 80,
    alignItems: 'center',
  },
  calendarCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: colorsLight.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorsLight.border,
    paddingVertical: 4,
    overflow: 'hidden',
    ...shadows.card,
  },
  calendar: {
    backgroundColor: colorsLight.surface,
  },
  stack: {
    marginHorizontal: 16,
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colorsLight.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorsLight.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...shadows.card,
  },
  iconBlock: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 15,
    color: colorsLight.text,
    letterSpacing: -0.1,
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    color: colorsLight.textMuted,
    marginTop: 2,
    includeFontPadding: false,
  },
  empty: {
    paddingTop: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colorsLight.textMuted,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colorsLight.raised,
    borderRadius: radius.pill,
    padding: 2,
  },
  segmentButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  segmentButtonActive: {
    backgroundColor: colorsLight.surface,
    ...shadows.card,
  },
  segmentLabel: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    color: colorsLight.textMuted,
    includeFontPadding: false,
  },
  segmentLabelActive: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    color: colorsLight.text,
  },
});
