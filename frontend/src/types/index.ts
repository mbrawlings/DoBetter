export type UpcomingEvent = {
  title: string;
  date?: string;
  notes?: string;
};

export type GiftIdea = {
  id?: string;
  title: string;
  notes?: string;
  occasion?: string;
  status?: string;
  priority?: number;
};

export type Interaction = {
  id?: string;
  summary: string;
  date?: string;
  channel?: string;
  location?: string;
};

export type GiftIdeaFormData = {
  title: string;
  notes?: string;
  occasion?: string;
  status?: string;
  priority?: string;
};

export type InteractionFormData = {
  summary: string;
  date?: string;
  channel?: string;
  location?: string;
};

export type UpcomingEventFormData = {
  title: string;
  date?: string;
  notes?: string;
};
