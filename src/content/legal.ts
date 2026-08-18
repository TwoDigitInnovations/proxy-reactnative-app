import type { RichBlock } from '../utils/richText';

export const LEGAL_LAST_UPDATED = '18 August 2026';

export const SUPPORT_EMAIL = 'info@cortexwork.com';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export function sectionsToBlocks(sections: LegalSection[]): RichBlock[] {
  return sections.flatMap<RichBlock>(section => [
    { type: 'heading', text: section.heading },
    ...section.paragraphs.map<RichBlock>(text => ({ type: 'paragraph', text })),
    ...(section.bullets ?? []).map<RichBlock>(text => ({ type: 'bullet', text })),
  ]);
}
