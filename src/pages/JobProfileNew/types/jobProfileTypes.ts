// jobProfile.types.ts

export type BulletNode = {
  id: string;
  text: string;
  children?: BulletNode[];
};

export type ParagraphNode = {
  id: string;
  text: string;
};

export type RichSection =
  | {
      type: "paragraph";
      content: ParagraphNode[];
    }
  | {
      type: "bullets";
      content: BulletNode[];
    };

export type JobProfile = {
  id: number;

  position: string;
  experience: string;

  // High-level description
  overview: RichSection[];

  // Detailed sections
  responsibilities?: RichSection;
  requiredSkills?: RichSection;
  niceToHave?: RichSection;
};