export interface FolderRecord {
  id: string;
  name: string;
  created_at: string;
}

export interface ImageRecord {
  id: string;
  folder_id: string;
  file_url: string;
  file_name: string;
  storage_key: string;
  uploaded_at: string;
}
