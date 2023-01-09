export type ValueElement = HTMLInputElement | HTMLSelectElement

export interface CheckChangeState {
	id: string
	name: string
	value: string
	checked: boolean
}
export type ChecksState = Record<string, CheckChangeState | undefined>

export interface SelectChangeState {
	value: string
	text: string
}
