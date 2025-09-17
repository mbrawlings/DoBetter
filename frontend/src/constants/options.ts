export const RELATIONSHIP_OPTIONS = ['spouse','sibling','parent','child','friend','colleague','other'] as const;
export const GIFT_OCCASION_OPTIONS = ['birthday','holiday','anniversary','other'] as const;
export const GIFT_STATUS_OPTIONS = ['idea','shortlist','purchased','gifted'] as const;
export const GIFT_PRIORITY_OPTIONS = ['1','2','3'] as const;
export const INTERACTION_CHANNEL_OPTIONS = ['irl','call','text','video','other'] as const;

export type RelationshipOption = typeof RELATIONSHIP_OPTIONS[number];
export type GiftOccasionOption = typeof GIFT_OCCASION_OPTIONS[number];
export type GiftStatusOption = typeof GIFT_STATUS_OPTIONS[number];
export type GiftPriorityOption = typeof GIFT_PRIORITY_OPTIONS[number];
export type InteractionChannelOption = typeof INTERACTION_CHANNEL_OPTIONS[number];


