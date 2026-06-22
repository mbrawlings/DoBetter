import * as React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Icon, Text } from 'react-native-paper';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useQuery } from '@apollo/client';
import {
  Avatar,
  BackButton,
  KeyFactChip,
  NavBar,
  NavLink,
  SectionLabel,
  SummaryRow,
} from '../components/ui';
import CurrentEventsBlock from '../components/sections/CurrentEventsBlock';
import {
  GET_PERSON_QUERY,
  GIFT_IDEAS_QUERY,
  INTERACTIONS_QUERY,
} from '../graphql/operations';
import { colorsLight, fontFamily, radius } from '../theme/theme';
import { formatEventCountdown, formatRelativeShort } from '../utils/date';
import type { GiftIdea, Interaction, UpcomingEvent } from '../types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ABOUT_PREVIEW_LINES = 4;
const ABOUT_LINE_HEIGHT = 22;

function birthdayShort(value?: string | null): string {
  if (!value) return '';
  const [, mm, dd] = value.split('T')[0].split('-').map(Number);
  if (!mm || !dd) return '';
  return `${MONTHS[mm - 1]} ${dd}`;
}

function nearestUpcoming(list: UpcomingEvent[]): UpcomingEvent | undefined {
  const future = list
    .map((e) => ({ e, t: new Date(e.startsAt || e.date || '').getTime() }))
    .filter((x) => !Number.isNaN(x.t) && x.t >= Date.now())
    .sort((a, b) => a.t - b.t);
  return future[0]?.e ?? list[0];
}

export default function PersonHubScreen({ navigation }: any) {
  const route = useRoute() as any;
  const personId: string = route.params?.id;

  const { data, loading, refetch } = useQuery(GET_PERSON_QUERY, {
    variables: { id: personId },
    fetchPolicy: 'cache-and-network',
  });
  const { data: giftData, refetch: refetchGifts } = useQuery(GIFT_IDEAS_QUERY, {
    variables: { personId },
    fetchPolicy: 'cache-and-network',
  });
  const { data: interData, refetch: refetchInter } = useQuery(INTERACTIONS_QUERY, {
    variables: { personId },
    fetchPolicy: 'cache-and-network',
  });

  useFocusEffect(
    React.useCallback(() => {
      refetch();
      refetchGifts();
      refetchInter();
    }, [refetch, refetchGifts, refetchInter]),
  );

  const person = data?.person;
  const gifts: GiftIdea[] = (giftData?.giftIdeas ?? []) as any;
  const moments: Interaction[] = (interData?.interactions ?? []) as any;
  const currentEvents: string[] = person?.currentEvents ?? [];
  const upcoming: UpcomingEvent[] = person?.upcomingEvents ?? [];

  const background: string = person?.background ?? '';
  const [aboutExpanded, setAboutExpanded] = React.useState(false);
  // Measured once from the untruncated first render; reset when the text changes.
  const [aboutFullHeight, setAboutFullHeight] = React.useState<number | null>(null);
  React.useEffect(() => {
    setAboutExpanded(false);
    setAboutFullHeight(null);
  }, [background]);
  const aboutOverflows =
    aboutFullHeight !== null && aboutFullHeight > ABOUT_PREVIEW_LINES * ABOUT_LINE_HEIGHT + 4;
  const truncateAbout = !aboutExpanded && aboutOverflows;

  function gotoEdit() {
    navigation.navigate('Person', { id: personId });
  }
  function goto(screen: string) {
    navigation.navigate(screen, { id: personId });
  }

  if (loading && !person) {
    return (
      <View style={styles.screen}>
        <NavBar title="" leading={<BackButton label="People" onPress={() => navigation.goBack()} />} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colorsLight.primary} />
        </View>
      </View>
    );
  }

  if (!person) {
    return (
      <View style={styles.screen}>
        <NavBar title="" leading={<BackButton label="People" onPress={() => navigation.goBack()} />} />
        <View style={styles.center}>
          <Text style={styles.muted}>Person not found.</Text>
        </View>
      </View>
    );
  }

  const fullName = `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim();
  const subtitle = [person.relationship, person.city].filter(Boolean).join(' · ');

  const lastContact = moments.length ? formatRelativeShort(moments[0].date) : '';
  const birthday = birthdayShort(person.birthDate);

  const eventsCount = currentEvents.length + upcoming.length;
  const near = nearestUpcoming(upcoming);
  let eventsPreview = '';
  if (near) {
    const cd = formatEventCountdown(near);
    eventsPreview = [near.title, cd.label].filter(Boolean).join(' ');
  } else if (currentEvents.length) {
    eventsPreview = currentEvents[0];
  }

  const momentsPreview = moments.length
    ? [moments[0].summary, formatRelativeShort(moments[0].date)].filter(Boolean).join(' · ')
    : '';

  const shortlistCount = gifts.filter((g) => g.status === 'shortlist').length;
  const topGift = gifts[0]?.title;
  const giftsPreview = [
    shortlistCount ? `${shortlistCount} shortlisted` : undefined,
    topGift,
  ]
    .filter(Boolean)
    .join(' · ');

  const isEmpty =
    currentEvents.length === 0 && upcoming.length === 0 && gifts.length === 0 && moments.length === 0;

  return (
    <View style={styles.screen}>
      <NavBar
        title={fullName}
        leading={<BackButton label="People" onPress={() => navigation.goBack()} />}
        trailing={<NavLink label="Edit" onPress={gotoEdit} bold />}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={gotoEdit} style={styles.header}>
          <Avatar firstName={person.firstName ?? ''} lastName={person.lastName ?? ''} size={68} />
          <View style={styles.headerBody}>
            <Text style={styles.name}>{fullName}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          <Icon source="chevron-right" size={18} color={colorsLight.textFaint} />
        </Pressable>

        {(birthday || person.employer || lastContact) ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {birthday ? <KeyFactChip icon="cake-variant-outline" label={`Birthday ${birthday}`} tinted /> : null}
            {person.employer ? <KeyFactChip icon="briefcase-outline" label={person.employer} /> : null}
            {lastContact ? <KeyFactChip icon="message-outline" label={`Last contact ${lastContact}`} /> : null}
          </ScrollView>
        ) : null}

        {background ? (
          <>
            <SectionLabel>About</SectionLabel>
            <Pressable
              onPress={() => navigation.navigate('Person', { id: personId, focus: 'background' })}
              style={styles.aboutCard}
            >
              <Text
                style={styles.aboutText}
                ellipsizeMode="tail"
                numberOfLines={truncateAbout ? ABOUT_PREVIEW_LINES : undefined}
                onLayout={(e) => {
                  if (aboutFullHeight === null) setAboutFullHeight(e.nativeEvent.layout.height);
                }}
              >
                {background}
              </Text>
            </Pressable>
            {aboutOverflows ? (
              <Pressable
                onPress={() => setAboutExpanded((v) => !v)}
                hitSlop={6}
                style={styles.readMoreWrap}
              >
                <Text style={styles.readMore}>{aboutExpanded ? 'Show less' : 'Read more'}</Text>
              </Pressable>
            ) : null}
          </>
        ) : null}

        {isEmpty ? (
          <>
            <View style={styles.hintCard}>
              <Text style={styles.hintText}>
                Nothing logged yet. Add what's going on, an upcoming event, or your first gift idea — it'll
                show up here as a quick refresher next time.
              </Text>
            </View>
            <SectionLabel>Start adding</SectionLabel>
            <View style={styles.sectionStack}>
              <SummaryRow
                icon="cake-variant-outline"
                iconBg={colorsLight.primarySoft}
                iconColor={colorsLight.primary}
                title="Events"
                preview="Birthdays, plans, milestones"
                trailing="plus"
                onPress={() => goto('Events')}
              />
              <SummaryRow
                icon="message-outline"
                iconBg={colorsLight.momentsIconBg}
                iconColor={colorsLight.momentsIconFg}
                title="Moments"
                preview="Log when you connect"
                trailing="plus"
                onPress={() => goto('Moments')}
              />
              <SummaryRow
                icon="gift-outline"
                iconBg={colorsLight.giftIconBg}
                iconColor={colorsLight.giftIconFg}
                title="Gift ideas"
                preview="Capture ideas as they come"
                trailing="plus"
                onPress={() => goto('Gifts')}
              />
            </View>
          </>
        ) : (
          <>
            <CurrentEventsBlock
              personId={personId}
              person={person}
              currentEvents={currentEvents}
              onChanged={refetch}
            />

            <SectionLabel>Sections</SectionLabel>
            <View style={styles.sectionStack}>
              <SummaryRow
                icon="cake-variant-outline"
                iconBg={colorsLight.primarySoft}
                iconColor={colorsLight.primary}
                title="Events"
                count={eventsCount}
                preview={eventsPreview}
                onPress={() => goto('Events')}
              />
              <SummaryRow
                icon="message-outline"
                iconBg={colorsLight.momentsIconBg}
                iconColor={colorsLight.momentsIconFg}
                title="Moments"
                count={moments.length}
                preview={momentsPreview}
                onPress={() => goto('Moments')}
              />
              <SummaryRow
                icon="gift-outline"
                iconBg={colorsLight.giftIconBg}
                iconColor={colorsLight.giftIconFg}
                title="Gift ideas"
                count={gifts.length}
                preview={giftsPreview}
                onPress={() => goto('Gifts')}
              />
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colorsLight.bg,
  },
  scroll: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  muted: {
    fontFamily: fontFamily.regular,
    color: colorsLight.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
  headerBody: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 24,
    letterSpacing: -0.6,
    color: colorsLight.text,
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 14,
    color: colorsLight.textMuted,
    marginTop: 3,
    includeFontPadding: false,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
  sectionStack: {
    marginHorizontal: 16,
    gap: 10,
  },
  aboutCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colorsLight.raised,
    borderWidth: 1,
    borderColor: colorsLight.borderStrong,
  },
  aboutText: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colorsLight.text,
    includeFontPadding: false,
  },
  readMoreWrap: {
    marginHorizontal: 16,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  readMore: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 14,
    color: colorsLight.primary,
    includeFontPadding: false,
  },
  hintCard: {
    marginHorizontal: 16,
    marginTop: 18,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colorsLight.raised,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colorsLight.borderStrong,
  },
  hintText: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colorsLight.textMuted,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
