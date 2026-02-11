
	interface Endpoints {
		'/v1/internal/items.byListId': {
			GET: (params: { listId: IList['_id']; offset?: number; count?: number }) => {
				items: IItem[];
				count: number;
				offset: number;
				total: number;
			};
		};
		'/v1/internal/items.byStageId': {
			GET: (params: { stageId: IStage['_id']; limit?: number }) => {
				items: IItem[];
				count: number;
				stageId: IStage['_id'];
				stageName: string;
			};
		};
		'/v1/internal/items.info': {
			GET: (params: { itemId: IItem['_id'] }) => {
				item: IItem & {
					listKey: string;
					stageKey: string;
					children: IItem[];
				};
			};
		};
		'/v1/internal/items.create': {
			POST: (params: {
				name: string;
				description?: string;
				listId: IList['_id'];
				stageId: IStage['_id'];
				parentId?: IItem['_id'];
				customFields?: ICustomFieldValue[];
				order?: number;
			}) => {
				item: IItem;
			};
		};
		'/v1/internal/items.update': {
			PUT: (params: { itemId: IItem['_id']; name?: string; description?: string; customFields?: ICustomFieldValue[] }) => {
				message: string;
				itemId: IItem['_id'];
			};
		};
		'/v1/internal/items.move': {
			POST: (params: { itemId: IItem['_id']; stageId: IStage['_id']; order?: number }) => {
				message: string;
				itemId: IItem['_id'];
				newStageId: IStage['_id'];
			};
		};
		'/v1/internal/items.delete': {
			DELETE: (params: { itemId: IItem['_id']; deleteChildren?: boolean }) => {
				message: string;
			};
		};
		'/v1/internal/items.batch-create': {
			POST: (params: {
				listId: IList['_id'];
				items: Array<{
					name: string;
					description?: string;
					stageId: IStage['_id'];
					parentId?: IItem['_id'];
					customFields?: ICustomFieldValue[];
					order?: number;
				}>;
			}) => {
				message: string;
				created: IItem[];
				errors: { item: any; error: string }[];
				totalCreated: number;
				totalFailed: number;
				processingTime: number;
			};
		};
		'/v1/internal/items.batch-move': {
			POST: (params: { itemIds: IItem['_id'][]; stageId: IStage['_id'] }) => {
				message: string;
				movedItems: IItem['_id'][];
				failedItems: { item: { itemId: string }; error: string }[];
				totalMoved: number;
				totalFailed: number;
				processingTime: number;
			};
		};
		'/v1/internal/items.batch-update': {
			POST: (params: {
				updates: Array<{
					itemId: IItem['_id'];
					name?: string;
					description?: string;
					stageId?: IStage['_id'];
					order?: number;
					customFields?: ICustomFieldValue[];
				}>;
			}) => {
				message: string;
				updated: IItem[];
				failed: { item: any; error: string }[];
				totalUpdated: number;
				totalFailed: number;
				processingTime: number;
			};
		};
		'/v1/internal/items.byKey': {
			GET: (params: { itemKey: string; roomId: string; listTemplateKey: string }) => {
				item: IItem & {
					listKey: string;
					stageKey: string;
					children: IItem[];
				};
			};
		};
		'/v1/internal/items.updateByKey': {
			PUT: (params: {
				itemKey: string;
				roomId: string;
				listTemplateKey: string;
				name?: string;
				description?: string;
				customFields?: ICustomFieldValue[];
			}) => {
				message: string;
				itemId: IItem['_id'];
				itemKey: string;
			};
		};
		'/v1/internal/items.moveByKey': {
			POST: (params: { itemKey: string; stageKey: string; roomId: string; listTemplateKey: string; order?: number }) => {
				message: string;
				itemId: IItem['_id'];
				itemKey: string;
				newStageId: IStage['_id'];
				newStageKey?: string;
			};
		};
		'/v1/internal/items.deleteByKey': {
			DELETE: (params: { itemKey: string; roomId: string; listTemplateKey: string; deleteChildren?: boolean }) => {
				message: string;
				itemKey: string;
			};
		};
		'/v1/internal/items.changeStageByKeys': {
			POST: (params: { itemId: IItem['_id']; stageKey: string; roomId: string; listTemplateKey: string; order?: number }) => {
				message: string;
				itemId: IItem['_id'];
				newStageId: IStage['_id'];
			};
		};
	}

