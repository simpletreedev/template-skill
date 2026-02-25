import type { IWorkflowAutomation, IAutomation } from '../../../core-typings/IWorkflowAutomation';
import { AutomationTriggerType, AutomationActionType, HttpMethod } from '../../../core-typings/IWorkflowAutomation';

/**
 * Personnel Recruitment Workflow Automation Template
 */

const processCVFilter: IAutomation = {
	id: 'process_cv_filter',
	name: 'Process CV Filter',
	description: 'Automatically process CV when item is updated with CV data in unfiltered stage',
	isActive: true,
	triggers: [
		{
			type: AutomationTriggerType.ITEM_UPDATED,
			config: {
				listKey: 'list_personnel_recruitment',
				stageKey: 'stage_unfiltered',
			},
			conditions: [
				{
					field: 'recruitment_cv_field',
					operator: 'is_not_empty',
					type: 'custom_field',
				},
			],
		},
	],
	actions: [
		{
			type: AutomationActionType.UPDATE_GENERATING_FIELDS,
			name: 'Mark CV Content as Generating',
			description: 'Mark CV content field as generating while converting to markdown',
			config: {
				targetItemKey: '{{item._id}}',
				fieldIds: ['recruitment_cv_content_field'],
				action: 'add',
			},
		},
		{
			type: AutomationActionType.CALL_METHOD,
			name: 'Convert CV to Markdown',
			description: 'Convert uploaded CV file to markdown format using Flowise',
			config: {
				methodName: 'automation.convertFileToMarkdown',
				params: ['{{item._id}}', 'recruitment_cv_field', 'recruitment_cv_content_field'],
			},
			errorHandling: {
				continueOnError: true,
				notifyOnError: true,
				errorRecipients: ['hr@company.com'],
			},
		},
		{
			type: AutomationActionType.UPDATE_GENERATING_FIELDS,
			name: 'Remove CV Content as Generating',
			description: 'Remove CV content field from generating state',
			config: {
				targetItemKey: '{{item._id}}',
				fieldIds: ['recruitment_cv_content_field'],
				action: 'remove',
			},
		},
		{
			type: AutomationActionType.UPDATE_GENERATING_FIELDS,
			name: 'Set AI Summary Field as Generating',
			description: 'Mark AI summary field and score as generating for this item',
			config: {
				targetItemKey: '{{item._id}}',
				fieldIds: ['recruitment_ai_summary_field', 'recruitment_ai_score_field'],
				action: 'add',
			},
		},
		{
			type: AutomationActionType.CALL_API,
			name: 'Process CV with Flowise',
			description: 'Call Flowise API to analyze CV',
			config: {
				url: `${process.env.PRIVOS_FLOW_API_URL}/prediction/ea031867-5a1b-48ab-ac09-257a360bb25e`,
				method: HttpMethod.POST,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': '{{env.PRIVOS_FLOW_API_KEY}}',
				},
				body: {
					form: {
						roomId: '{{list.roomId}}',
						item_id: '{{item._id}}',
						action: 'screen_unfiltered_candidate',
					},
				},
				bodyType: 'json',
				timeout: 60000,
				retryPolicy: {
					maxRetries: 2,
					retryDelay: 3000,
					retryOn: [500, 502, 503],
				},
				responseMapping: {
					dataPath: 'text',
					successPath: 'success',
					errorPath: 'error',
				},
			},
			errorHandling: {
				continueOnError: true,
				notifyOnError: true,
				errorRecipients: ['hr@company.com'],
			},
		},
		{
			type: AutomationActionType.UPDATE_GENERATING_FIELDS,
			name: 'Remove AI Summary Field as Generating',
			description: 'Remove AI summary field and score as generating for this item',
			config: {
				targetItemKey: '{{item._id}}',
				fieldIds: ['recruitment_ai_summary_field', 'recruitment_ai_score_field'],
				action: 'remove',
			},
		},
	],
	variables: {},
	settings: {
		enabled: true,
	},
	statistics: {
		totalExecutions: 0,
		successfulExecutions: 0,
		failedExecutions: 0,
	},
	metadata: {
		version: '1.0.3',
		category: 'recruitment',
		tags: ['cv-processing', 'ai', 'flowise', 'markdown-conversion'],
	},
};

// Generate Interview Questions
const generateInterviewQuestions: IAutomation = {
	id: 'generate_interview_questions',
	name: 'Generate Interview Questions',
	description: 'Automatically generate interview questions for candidates',
	isActive: true,
	triggers: [
		{
			type: AutomationTriggerType.ITEM_UPDATED,
			config: {
				listKey: 'list_personnel_recruitment',
				stageKey: 'stage_filtered',
			},
			conditions: [
				{
					field: 'recruitment_interview_time_field',
					operator: 'is_not_empty',
					type: 'custom_field',
				},
			],
		},
	],
	actions: [
		{
			type: AutomationActionType.UPDATE_GENERATING_FIELDS,
			name: 'Mark Interview Questions as Generating',
			description: 'Mark interview questions as generating for this item',
			config: {
				targetItemKey: '{{item._id}}',
				fieldIds: ['recruitment_interview_questions_field'],
				action: 'add',
			},
		},
		{
			type: AutomationActionType.CALL_API,
			name: 'Generate Interview Questions',
			description: 'Call Flowise API to generate interview questions',
			config: {
				url: `${process.env.PRIVOS_FLOW_API_URL}/prediction/ea031867-5a1b-48ab-ac09-257a360bb25e`,
				method: HttpMethod.POST,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': '{{env.PRIVOS_FLOW_API_KEY}}',
				},
				body: {
					form: {
						roomId: '{{list.roomId}}',
						item_id: '{{item._id}}',
						action: 'gen_question_to_interview',
					},
				},
				bodyType: 'json',
				timeout: 60000,
				retryPolicy: {
					maxRetries: 2,
					retryDelay: 3000,
					retryOn: [500, 502, 503],
				},
			},
			errorHandling: {
				continueOnError: true,
			},
		},
		{
			type: AutomationActionType.UPDATE_GENERATING_FIELDS,
			name: 'Remove Interview Questions as Generating',
			description: 'Remove interview questions as generating for this item',
			config: {
				targetItemKey: '{{item._id}}',
				fieldIds: ['recruitment_interview_questions_field'],
				action: 'remove',
			},
		},
	],
	variables: {},
	settings: {
		enabled: true,
	},
	statistics: {
		totalExecutions: 0,
		successfulExecutions: 0,
		failedExecutions: 0,
	},
	metadata: {
		version: '1.0.2',
		category: 'recruitment',
		tags: ['ai', 'candidate-screening', 'flowise'],
	},
};

// Classification of CV
const classifyCV: IAutomation = {
	id: 'classify_cv',
	name: 'Classify CV',
	description: 'Automatically classify CV based on interview score',
	isActive: true,
	triggers: [
		{
			type: AutomationTriggerType.ITEM_UPDATED,
			config: {
				listKey: 'list_personnel_recruitment',
				stageKey: 'stage_interviewed',
			},
			conditions: [
				{
					field: 'recruitment_interview_score_field',
					operator: 'is_not_empty',
					type: 'custom_field',
				},
			],
		},
		{
			type: AutomationTriggerType.ITEM_UPDATED,
			config: {
				listKey: 'list_personnel_recruitment',
				stageKey: 'stage_ready_to_interview',
			},
			conditions: [
				{
					field: 'recruitment_interview_score_field',
					operator: 'is_not_empty',
					type: 'custom_field',
				},
			],
		},
	],
	actions: [
		{
			type: AutomationActionType.CALL_API,
			name: 'Classify CV',
			description: 'Call Flowise API to classify CV',
			config: {
				url: `${process.env.PRIVOS_FLOW_API_URL}/prediction/ea031867-5a1b-48ab-ac09-257a360bb25e`,
				method: HttpMethod.POST,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': '{{env.PRIVOS_FLOW_API_KEY}}',
				},
				body: {
					form: {
						roomId: '{{list.roomId}}',
						item_id: '{{item._id}}',
						action: 'finalize_interview_outcome',
					},
				},
				bodyType: 'json',
				timeout: 60000,
				retryPolicy: {
					maxRetries: 2,
					retryDelay: 3000,
					retryOn: [500, 502, 503],
				},
				errorHandling: {
					continueOnError: true,
				},
			},
		},
	],
	variables: {},
	settings: {
		enabled: true,
	},
	statistics: {
		totalExecutions: 0,
		successfulExecutions: 0,
		failedExecutions: 0,
	},
	metadata: {
		version: '1.0.1',
		category: 'recruitment',
		tags: ['notifications', 'interview', 'stage-change'],
	},
};

// Personnel Recruitment Workflow
const personnelRecruitmentWorkflow: Omit<IWorkflowAutomation, '_id' | '_updatedAt'> = {
	templateKey: 'personnel-recruitment',
	automations: [processCVFilter, generateInterviewQuestions, classifyCV],
	isActive: true,
	description: 'Comprehensive workflow automation for personnel recruitment process',
	createdAt: new Date(),
	metadata: {
		version: '1.0.18',
		category: 'hr',
		tags: ['recruitment', 'ai', 'automation'],
		isSystemTemplate: true,
	},
};

export default personnelRecruitmentWorkflow;

export { processCVFilter, generateInterviewQuestions, classifyCV, personnelRecruitmentWorkflow };
