import { model, Schema,  } from "mongoose";
import type {Document} from "mongoose";

export interface IPlatform extends Document, Timestamp {
  name: string;
  label: string;
  editorType: string;
  description: string;
  url: string;
  enableImport: boolean;
  enableLogin: boolean;
  loggedIn: boolean;
}

const platformSchema = new Schema(
  {
    name: String,
    label: String,
    editorType: String,
    description: String,
    url: String,
    enableImport: Boolean,
    enableLogin: Boolean,
    loggedIn: Boolean,
  },
  {
    timestamps: true,
  }
);

export const Platform = model<IPlatform>("platform", platformSchema, 'platform');
