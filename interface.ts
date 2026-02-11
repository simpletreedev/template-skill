export type FieldType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "DATE"
  | "DATE_TIME"
  | "SELECT"
  | "MULTI_SELECT"
  | "USER"
  | "CHECKBOX"
  | "URL"
  | "FILE"
  | "FILE_MULTIPLE"
  | "DOCUMENT"
  | "ASSIGNEE"
  | "DEADLINE";

interface IFieldDefinition {
  _id: string; // auto generated
  key?: string;
  name: string;
  type: FieldType;
  options?: { _id: string; value: string; color?: string; order?: number }[];
  order: number;
}

interface IList {
  _id: string; // auto generated
  roomId: string; // from user question
  name: string;
  description?: string;
  fieldDefinitions: IFieldDefinition[];
}

interface IStage {
  _id: string; // auto generated
  key: string;
  name: string;
  listId: string;
  order: number;
  color: string;
}

interface IDocument {
  _id: string; // auto generated
  title: string;
  content: string; // could be markdown or plain text
  description?: string;
  roomId: string; // from user question
}

interface IItem {
  _id: string; // auto generated
  name?: string;
  key: string;
  description?: string;
  listId: IList["_id"];
  stageId: IStage["_id"];
  order: number;
  parentId?: IItem["_id"];
  customFields: ICustomFieldValue[];
}

interface ICustomFieldValue {
  fieldId: IFieldDefinition["_id"];
  value: any; // Value of any type, depending on the `type` of the field
}

interface ITemplate {
  templateKey: string;
  name: string;
  description: string;
  icon?: string;
  isActive: true;
  lists: [];
  documents: [];
  metadata: {
    version: string;
  };
}

/* generate rules:
- generate lists, each with field definitions and stages
- generate documents
- generate items within lists and stages
- use custom fields based on field definitions
- ensure unique keys for lists, stages, items, and templates
- maintain relationships between lists, stages, items, and documents
- provide metadata for templates

*/

