
	interface Endpoints {
		'/v1/internal/documents/:documentId': {
			GET: (params: { documentId: string }) => {
				document: IDocument;
			};
			PUT: (params: { documentId: string; title?: string; content?: string; description?: string }) => {
				document: IDocument;
			};
			DELETE: (params: { documentId: string }) => {
				deleted: boolean;
			};
		};
		'/v1/internal/documents.byRoomId': {
			GET: (params: { roomId: string; offset?: number; count?: number }) => {
				documents: IDocument[];
				count: number;
				offset: number;
				total: number;
			};
		};
		'/v1/internal/documents.byTemplateKey': {
			GET: (params: { templateKey: string; roomId: string }) => {
				documents: IDocument[];
			};
		};
		'/v1/internal/documents.byTemplateDocumentKey': {
			GET: (params: { templateDocumentKey: string; roomId: string }) => {
				document: IDocument;
			};
		};
		'/v1/internal/documents.versions': {
			GET: (params: { documentId: string }) => {
				documentId: string;
				currentVersion: number;
				versions: { version: number; createdAt: Date; createdBy: string }[];
			};
		};
		'/v1/internal/documents.getVersion': {
			GET: (params: { documentId: string; version: string }) => {
				documentTitle: string;
				version: Pick<IDocumentVersion, 'version' | 'content' | 'createdAt'> & { createdBy: string };
			};
		};
		'/v1/internal/documents.create': {
			POST: (params: { roomId: string; title: string; content: string; description?: string }) => {
				document: IDocument;
			};
		};
		'/v1/internal/documents.revert': {
			POST: (params: { documentId: string; version: string }) => {
				document: IDocument;
			};
		};
		'/v1/internal/documents.batch-create': {
			POST: (params: { roomId: string; documents: { title: string; content: string; description?: string }[] }) => {
				message: string;
				created: IDocument[];
				errors: { title: string; error: string }[];
				totalCreated: number;
				totalErrors: number;
				processingTime: number;
			};
		};
	}

