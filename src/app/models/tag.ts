export interface Tag {
	id: string
	value: string
	color: string
	createdAt: string
	lastModifiedAt: string
	deleted: boolean
}

export interface TagModified {
	value?: string
	color?: string
}