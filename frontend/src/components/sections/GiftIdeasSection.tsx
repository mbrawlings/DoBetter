import * as React from 'react';
import ItemListSection from './ItemListSection';
import GiftIdeaModal from '../modals/GiftIdeaModal';
import type { GiftIdeaForm } from '../modals/GiftIdeaModal';
import type { GiftIdea } from '../../types';

export type { GiftIdeaForm };

type Props = {
  items: GiftIdea[];
  onAdd: (form: GiftIdeaForm) => void;
  onEdit?: (index: number, form: GiftIdeaForm) => void;
  onDelete?: (index: number) => void;
};

const EMPTY_FORM: GiftIdeaForm = { title: '', notes: '', occasion: '', status: '', priority: '' };

function toForm(item: GiftIdea): GiftIdeaForm {
  return {
    title: item.title,
    notes: item.notes || '',
    occasion: item.occasion || '',
    status: item.status || '',
    priority: item.priority ? String(item.priority) : '',
  };
}

export default function GiftIdeasSection({ items, onAdd, onEdit, onDelete }: Props) {
  return (
    <ItemListSection<GiftIdea, GiftIdeaForm>
      sectionTitle="Gift Ideas"
      addLabel="Add gift idea"
      items={items}
      getTitle={(gi) => gi.title}
      getSubtitle={(gi) =>
        [gi.notes, gi.occasion, gi.status, gi.priority ? `priority ${gi.priority}` : undefined]
          .filter(Boolean)
          .join(' \u2022 ')
      }
      toForm={toForm}
      emptyForm={EMPTY_FORM}
      renderModal={(props) => <GiftIdeaModal {...props} />}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
