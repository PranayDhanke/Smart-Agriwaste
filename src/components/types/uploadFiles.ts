export interface IKFile {
  fileId: string;
  name: string;
}

export type IKListResponse =
  | IKFile[]
  | { results: IKFile[] }
  | { items: IKFile[] }
  | { files: IKFile[] }
  | Record<string, unknown>;
