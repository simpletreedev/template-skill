
	interface Endpoints {
		'/v1/internal/stages.byListId': {
			GET: (params: { listId: IList['_id'] }) => {
				stages: (IStage & { itemCount: number })[];
				count: number;
			};
		};
		'/v1/internal/stages/:stageId': {
			GET: () => {
				stage: IStage;
				itemCount: number;
			};
			PUT: (params: { name?: string; color?: string }) => {
				message: string;
				stageId: IStage['_id'];
			};
			DELETE: (params: { moveItemsToStageId?: IStage['_id'] }) => {
				message: string;
			};
		};
		'/v1/internal/stages.create': {
			POST: (params: { listId: IList['_id']; name: string; color: string; order?: number }) => {
				stage: Pick<IStage, '_id' | 'name' | 'listId' | 'order' | 'color'>;
			};
		};
		'/v1/internal/stages.reorder': {
			POST: (params: { listId: IList['_id']; stageIds: IStage['_id'][] }) => {
				message: string;
			};
		};
		'/v1/internal/stages.items': {
			GET: (params: { stageId: IStage['_id']; limit?: number }) => {
				stageId: IStage['_id'];
				stageName: string;
				items: Partial<IItem>[];
				count: number;
			};
		};
	}

