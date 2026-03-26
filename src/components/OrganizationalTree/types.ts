export interface LocalizedString {
  ar: string;
  en: string | null;
}

export interface OrgNode {
  id: string;
  title: LocalizedString;
  name?: LocalizedString;
  bioName?: LocalizedString;
  bio?: LocalizedString | null;
  children?: OrgNode[];
}
