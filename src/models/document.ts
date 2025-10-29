export interface Contributors {
  ID: string;
  Name: string;
}

export interface Document {
  ID: string;
  Title: string;
  Contributors: Contributors[];
  Version: number | string;
  Attachments: string[];
  CreatedAt: Date;
  UpdatedAt: Date;
}

export type SortField = 'Title' | 'Version' | 'CreatedAt';
export type SortOrder = 'asc' | 'desc';
