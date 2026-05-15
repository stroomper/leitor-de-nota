const STORAGE_KEY = "nfce-notes-v1";

export function loadNotes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function flattenItems(notes) {
  return notes.flatMap((note) => note.items.map((item) => ({
    noteId: note.id,
    source: note.source,
    ...item
  })));
}
