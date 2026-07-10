import { useState } from 'react';

// Manages the add/edit-event modal and its emoji picker.
export function useEventModal() {
  const [modal, setModal] = useState(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const openModal = (m) => setModal(m);
  const closeModal = () => { setModal(null); setEmojiPickerOpen(false); };
  const patchModal = (patch) => setModal((m) => ({ ...m, ...patch }));

  const m = modal || {};
  const canSave = !!(m.title?.trim() && m.start && m.date);

  return { modal, m, canSave, openModal, closeModal, patchModal, emojiPickerOpen, setEmojiPickerOpen };
}
