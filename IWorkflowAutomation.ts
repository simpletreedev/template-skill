import type { IRocketChatRecord } from '@rocket.chat/core-typings';

export enum AutomationTriggerType {
	ITEM_CREATED = 'item_created',
	ITEM_UPDATED = 'item_updated',
	ITEM_DELETED = 'item_deleted',
	ITEM_STAGE_CHANGED = 'item_stage_changed',
	ITEM_FIELD_CHANGED = 'item_field_changed',
	ITEM_ASSIGNED = 'item_assigned',
	ITEM_ARCHIVED = 'item_archived',
	ITEM_UNARCHIVED = 'item_unarchived',
	DEADLINE_APPROACHING = 'deadline_approaching',
	DEADLINE_PASSED = 'deadline_passed',
	STAGE_CREATED = 'stage_created',
	STAGE_UPDATED = 'stage_updated',
	STAGE_DELETED = 'stage_deleted',
	LIST_CREATED = 'list_created',
	LIST_UPDATED = 'list_updated',
	DOCUMENT_CREATED = 'document_created',
	DOCUMENT_UPDATED = 'document_updated',
	TIME_BASED = 'time_based',
	WEBHOOK_RECEIVED = 'webhook_received',
}

export enum AutomationActionType {
	CALL_API = 'call_api',
	CALL_METHOD = 'call_method',
	UPDATE_ITEM = 'update_item',
	CREATE_ITEM = 'create_item',
	DELETE_ITEM = 'delete_item',
	MOVE_ITEM = 'move_item',
	UPDATE_FIELD = 'update_field',
	UPDATE_GENERATING_FIELDS = 'update_generating_fields',
	ARCHIVE_ITEM = 'archive_item',
	UNARCHIVE_ITEM = 'unarchive_item',
	SEND_NOTIFICATION = 'send_notification',
	SEND_EMAIL = 'send_email',
	CREATE_DOCUMENT = 'create_document',
	UPDATE_DOCUMENT = 'update_document',
	ASSIGN_USER = 'assign_user',
	ADD_COMMENT = 'add_comment',
	CREATE_TASK = 'create_task',
	TRIGGER_WORKFLOW = 'trigger_workflow',
}

export enum HttpMethod {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	PATCH = 'PATCH',
	DELETE = 'DELETE',
}

export interface IAutomationCondition {
	field: string;
	operator:
		| 'equals'
		| 'not_equals'
		| 'contains'
		| 'not_contains'
		| 'greater_than'
		| 'less_than'
		| 'in'
		| 'not_in'
		| 'is_empty'
		| 'is_not_empty';
	value?: any;
	type?: 'field' | 'custom_field' | 'system';
}

export interface IAutomationTrigger {
	type: AutomationTriggerType;
	config: {
		listKey?: string;
		stageKey?: string;
		fromStageKey?: string;
		toStageKey?: string;
		fieldId?: string;
		documentKey?: string;
		deadline?: {
			fieldId: string;
			daysBefore?: number;
			daysAfter?: number;
		};
		schedule?: {
			cron?: string;
			timezone?: string;
			runAt?: Date;
		};
		webhook?: {
			secret?: string;
			validatePayload?: boolean;
		};
	};
	conditions?: IAutomationCondition[];
	conditionLogic?: 'AND' | 'OR';
}

export interface IApiCallAction {
	url: string;
	method: HttpMethod;
	headers?: Record<string, string>;
	queryParams?: Record<string, any>;
	body?: any;
	bodyType?: 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';
	authentication?: {
		type: 'none' | 'bearer' | 'basic' | 'api-key' | 'oauth2';
		config?: Record<string, any>;
	};
	timeout?: number;
	retryPolicy?: {
		maxRetries: number;
		retryDelay: number;
		retryOn?: number[];
	};
	responseMapping?: {
		successPath?: string;
		errorPath?: string;
		dataPath?: string;
	};
}

export interface IMethodCallAction {
	methodName: string;
	params?: any[];
	module?: string;
	async?: boolean;
}

export interface IUpdateItemAction {
	targetItemKey?: string;
	fields: Record<string, any>;
	customFields?: Array<{
		fieldId: string;
		value: any;
	}>;
}

export interface ICreateItemAction {
	listKey: string;
	stageKey: string;
	name: string;
	description?: string;
	customFields?: Array<{
		fieldId: string;
		value: any;
	}>;
	parentKey?: string;
}

export interface IMoveItemAction {
	targetItemKey?: string;
	toStageKey: string;
	toListKey?: string;
	updateOrder?: boolean;
}

export interface IUpdateGeneratingFieldsAction {
	targetItemKey?: string; // Item ID to update, defaults to current item
	fieldIds: string[];
	action: 'add' | 'remove' | 'set';
}

export interface IArchiveItemAction {
	targetItemKey?: string;
	reason?: string;
	notifyAssignee?: boolean;
}

export interface INotificationAction {
	recipients: {
		users?: string[];
		roles?: string[];
		channels?: string[];
		emails?: string[];
		dynamicRecipients?: {
			field: string;
			type: 'assignee' | 'creator' | 'updater' | 'custom_field';
		}[];
	};
	template: {
		title: string;
		body: string;
		type?: 'info' | 'warning' | 'error' | 'success';
		actionUrl?: string;
		actionLabel?: string;
	};
	channels?: ('in-app' | 'email' | 'push' | 'sms')[];
}

export interface IAutomationAction {
	type: AutomationActionType;
	name: string;
	description?: string;
	config:
		| IApiCallAction
		| IMethodCallAction
		| IUpdateItemAction
		| ICreateItemAction
		| IMoveItemAction
		| IUpdateGeneratingFieldsAction
		| IArchiveItemAction
		| INotificationAction
		| Record<string, any>;
	errorHandling?: {
		continueOnError?: boolean;
		fallbackAction?: IAutomationAction;
		notifyOnError?: boolean;
		errorRecipients?: string[];
	};
	delay?: {
		duration: number;
		unit: 'seconds' | 'minutes' | 'hours' | 'days';
	};
}

export interface IAutomation {
	id: string;
	name: string;
	description?: string;
	isActive: boolean;
	triggers: IAutomationTrigger[];
	triggerLogic?: 'AND' | 'OR'; // Logic between multiple triggers (default: OR)
	actions: IAutomationAction[];
	variables?: Record<
		string,
		{
			name: string;
			type: 'string' | 'number' | 'boolean' | 'array' | 'object';
			defaultValue?: any;
			description?: string;
		}
	>;
	settings?: {
		maxExecutionsPerHour?: number;
		maxExecutionsPerDay?: number;
		cooldownPeriod?: number;
		priority?: 'low' | 'normal' | 'high';
		runAsUser?: string;
		timezone?: string;
		enabled?: boolean;
	};
	statistics?: {
		totalExecutions: number;
		successfulExecutions: number;
		failedExecutions: number;
		lastExecutedAt?: Date;
		averageExecutionTime?: number;
	};
	metadata?: Record<string, unknown>;
}

export interface IWorkflowAutomation extends IRocketChatRecord {
	templateKey: string;
	automations: IAutomation[];
	isActive: boolean;
	description?: string;
	createdAt: Date;
	updatedAt?: Date;
	metadata?: Record<string, unknown>;
}
