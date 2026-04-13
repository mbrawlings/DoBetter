import * as React from 'react';
import ItemListSection from './ItemListSection';
import InteractionModal from '../modals/InteractionModal';
import type { InteractionForm } from '../modals/InteractionModal';
import type { Interaction } from '../../types';

export type { InteractionForm };

type Props = {
  items: Interaction[];
  onAdd: (form: InteractionForm) => void;
  onEdit?: (index: number, form: InteractionForm) => void;
  onDelete?: (index: number) => void;
};

const EMPTY_FORM: InteractionForm = { summary: '', date: '', channel: '', location: '' };

function toForm(item: Interaction): InteractionForm {
  return {
    summary: item.summary,
    date: item.date || '',
    channel: item.channel || '',
    location: item.location || '',
  };
}

export default function InteractionsSection({ items, onAdd, onEdit, onDelete }: Props) {
  return (
    <ItemListSection<Interaction, InteractionForm>
      sectionTitle="Interactions"
      addLabel="Add interaction"
      items={items}
      getTitle={(ix) => ix.summary}
      getSubtitle={(ix) => [ix.date, ix.channel, ix.location].filter(Boolean).join(' \u2022 ')}
      toForm={toForm}
      emptyForm={EMPTY_FORM}
      renderModal={(props) => <InteractionModal {...props} />}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
