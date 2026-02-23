/**
 * Template JSON Generator Types
 * Based on Privos Chat interface definitions
 */

// ==================== Field Types ====================
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

// ==================== Option ====================
export interface IOption {
    value: string;
    color?: string;
    order?: number;
}

// ==================== Field Definition (Template) ====================
export interface ITemplateFieldDefinition {
    key: string;
    name: string;
    type: FieldType;
    options?: IOption[];
    order: number;
    required?: boolean;
    defaultValue?: any;
}

// ==================== Stage (Template) ====================
export interface ITemplateStage {
    key: string;
    name: string;
    color: string;
    order: number;
    description?: string;
}

// ==================== Custom Field Value (Template) ====================
export interface ITemplateCustomFieldValue {
    fieldKey: string; // References fieldDefinition.key
    value: any;
}

// ==================== Item (Template) ====================
export interface ITemplateItem {
    key: string;
    name: string;
    description?: string;
    stageKey: string; // References stage.key
    order: number;
    parentKey?: string; // References another item.key
    customFields?: ITemplateCustomFieldValue[];
}

// ==================== List (Template) ====================
export interface ITemplateList {
    key: string;
    name: string;
    description?: string;
    fieldDefinitions: ITemplateFieldDefinition[];
    stages: ITemplateStage[];
    items?: ITemplateItem[];
}

// ==================== Document (Template) ====================
export interface ITemplateDocument {
    key: string;
    title: string;
    content: string; // Markdown or plain text
    description?: string;
}

// ==================== Template Metadata ====================
export interface ITemplateMetadata {
    version: string;
    author?: string;
    createdAt?: string;
    updatedAt?: string;
    tags?: string[];
    category?: string;
}

// ==================== Main Template ====================
export interface ITemplate {
    templateKey: string;
    name: string;
    description: string;
    icon?: string;
    isActive: boolean;
    lists: ITemplateList[];
    documents: ITemplateDocument[];
    metadata: ITemplateMetadata;
}

// ==================== Color Palettes ====================
export const STAGE_COLORS = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // yellow
    "#ef4444", // red
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
];

export const OPTION_COLORS = [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // yellow
    "#EF4444", // red
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#06B6D4", // cyan
    "#84CC16", // lime
    "#F97316", // orange
    "#6366F1", // indigo
];

// ==================== Helper Functions ====================

/**
 * Generate a slug/key from a string
 */
export function toKey(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

/**
 * Get color by index with cycling
 */
export function getStageColor(index: number): string {
    return STAGE_COLORS[index % STAGE_COLORS.length];
}

export function getOptionColor(index: number): string {
    return OPTION_COLORS[index % OPTION_COLORS.length];
}

/**
 * Create field definition with defaults
 */
export function createFieldDefinition(
    name: string,
    type: FieldType,
    order: number,
    options?: string[]
): ITemplateFieldDefinition {
    const field: ITemplateFieldDefinition = {
        key: toKey(name),
        name,
        type,
        order,
    };

    if (options && (type === "SELECT" || type === "MULTI_SELECT")) {
        field.options = options.map((value, idx) => ({
            value,
            color: getOptionColor(idx),
            order: idx,
        }));
    }

    return field;
}

/**
 * Create stage with defaults
 */
export function createStage(
    name: string,
    order: number,
    color?: string
): ITemplateStage {
    return {
        key: toKey(name),
        name,
        color: color || getStageColor(order),
        order,
    };
}

/**
 * Create item with defaults
 */
export function createItem(
    name: string,
    stageKey: string,
    order: number,
    description?: string,
    customFields?: ITemplateCustomFieldValue[]
): ITemplateItem {
    return {
        key: toKey(name),
        name,
        stageKey,
        order,
        ...(description && { description }),
        ...(customFields && { customFields }),
    };
}

/**
 * Create document with defaults
 */
export function createDocument(
    title: string,
    content: string,
    description?: string
): ITemplateDocument {
    return {
        key: toKey(title),
        title,
        content,
        ...(description && { description }),
    };
}

/**
 * Validate template structure
 */
export function validateTemplate(template: ITemplate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!template.templateKey) errors.push("templateKey is required");
    if (!template.name) errors.push("name is required");
    if (!template.description) errors.push("description is required");
    if (!template.lists || !Array.isArray(template.lists)) errors.push("lists must be an array");
    if (!template.documents || !Array.isArray(template.documents)) errors.push("documents must be an array");
    if (!template.metadata) errors.push("metadata is required");

    // Validate lists
    const listKeys = new Set<string>();
    template.lists?.forEach((list, listIdx) => {
        if (!list.key) errors.push(`List ${listIdx}: key is required`);
        if (listKeys.has(list.key)) errors.push(`List ${listIdx}: duplicate key "${list.key}"`);
        listKeys.add(list.key);

        // Validate field definitions
        const fieldKeys = new Set<string>();
        list.fieldDefinitions?.forEach((field, fieldIdx) => {
            if (!field.key) errors.push(`List "${list.key}" Field ${fieldIdx}: key is required`);
            if (fieldKeys.has(field.key)) errors.push(`List "${list.key}" Field ${fieldIdx}: duplicate key "${field.key}"`);
            fieldKeys.add(field.key);
        });

        // Validate stages
        const stageKeys = new Set<string>();
        list.stages?.forEach((stage, stageIdx) => {
            if (!stage.key) errors.push(`List "${list.key}" Stage ${stageIdx}: key is required`);
            if (stageKeys.has(stage.key)) errors.push(`List "${list.key}" Stage ${stageIdx}: duplicate key "${stage.key}"`);
            stageKeys.add(stage.key);
        });

        // Validate items
        list.items?.forEach((item, itemIdx) => {
            if (!item.stageKey) errors.push(`List "${list.key}" Item ${itemIdx}: stageKey is required`);
            if (!stageKeys.has(item.stageKey)) {
                errors.push(`List "${list.key}" Item ${itemIdx}: stageKey "${item.stageKey}" not found in stages`);
            }

            // Validate custom fields
            item.customFields?.forEach((cf, cfIdx) => {
                if (!fieldKeys.has(cf.fieldKey)) {
                    errors.push(`List "${list.key}" Item ${itemIdx} CustomField ${cfIdx}: fieldKey "${cf.fieldKey}" not found in fieldDefinitions`);
                }
            });
        });
    });

    // Validate documents
    const docKeys = new Set<string>();
    template.documents?.forEach((doc, docIdx) => {
        if (!doc.key) errors.push(`Document ${docIdx}: key is required`);
        if (docKeys.has(doc.key)) errors.push(`Document ${docIdx}: duplicate key "${doc.key}"`);
        docKeys.add(doc.key);
    });

    return {
        valid: errors.length === 0,
        errors,
    };
}
