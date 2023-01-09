import { CheckChangeState } from 'react-utils/dist/hooks'

export interface ReserveCheckChangeState extends CheckChangeState {
	dateAxisIndex: number
	timeAxisIndex: number
}

export type ReserveChecksState = Record<
	string,
	ReserveCheckChangeState | undefined
>
