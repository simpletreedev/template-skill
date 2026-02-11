
	interface Endpoints {
		'/v1/internal/lists.list': {
			GET: () => {
				lists: IList[];
				count: number;
				offset: number;
				total: number;
			};
		};
		'/v1/internal/lists/:listId': {
			GET: () => {
				list: IList;
				stages: IStage[];
				items: IItem[];
			};
			PUT: (params: { listId: IList['_id']; name?: string; description?: string }) => {
				message?: string;
				listId?: IList['_id'];
			};
			DELETE: () => {
				message?: string;
			};
		};
		'/v1/internal/lists.byTemplateKey': {
			GET: (params: { roomId: IRoom['_id']; templateKey: string }) => {
				lists: IList[];
				stages: IStage[];
				items: IItem[];
			};
		};
		'/v1/internal/lists.byTemplateListKey': {
			GET: (params: { roomId: IRoom['_id']; templateListKey: string }) => {
				list: IList;
				stages: IStage[];
				items: IItem[];
			};
		};
		'/v1/internal/lists.byRoomId': {
			GET: (params: { roomId: IRoom['_id']; offset?: number; count?: number }) => {
				lists: (Pick<IList, '_id' | 'name' | 'description' | 'createdAt'> & { stageCount: number; itemCount: number })[];
				count: number;
				offset: number;
				total: number;
			};
		};
		'/v1/internal/lists.create': {
			POST: (params: {
				name: string;
				roomId: IRoom['_id'];
				description?: string;
				fieldDefinitions?: IFieldDefinition[];
				stages?: Array<{
					name: string;
					color?: string;
					order?: number;
				}>;
			}) => {
				list: Pick<IList, '_id' | 'name' | 'roomId'>;
			};
		};
		'/v1/internal/lists.fields/:listId': {
			GET: () => {
				fieldDefinitions: IFieldDefinition[];
			};
			POST: (params: { field: IFieldDefinition }) => {
				message: string;
				fieldId: string;
			};
			PUT: (params: { fieldDefinitions: IFieldDefinition[] }) => {
				message: string;
			};
		};
	}
