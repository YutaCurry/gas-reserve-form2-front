import { CheckChangeState } from '../../util/hooks/types'

export interface ReserveCheckChangeState extends CheckChangeState {
	dateAxisIndex: number
	timeAxisIndex: number
}

export type ReserveChecksState = Record<
	string,
	ReserveCheckChangeState | undefined
>
