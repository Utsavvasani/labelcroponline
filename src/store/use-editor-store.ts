import { BoundingBox } from "@/types";

export interface EditorState {
  activeFile: File | null;
  zoomLevel: number;
  activeCropRegion: BoundingBox | null;
}

// Global state container placeholder for document, crop, and canvas zoom
export const initialEditorState: EditorState = {
  activeFile: null,
  zoomLevel: 1.0,
  activeCropRegion: null,
};
