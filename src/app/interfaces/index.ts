export interface IQuery {
	page?: string | number;
	limit?: string | number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	searchTerm?: string;
	specialization?: string;
	email?: string;
	licenseNumber?: string;
	verificationStatus?: string;
	[key: string]: unknown;
}
