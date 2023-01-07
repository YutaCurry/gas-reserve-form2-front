import { useEffect, useState } from 'react'
import { useStateWithInputChecks } from '../../util/hooks'
import { getReserveMatrix } from '../api'
import { extractEmptyIndex } from '../funcs'
import { ReserveMatrixData } from '../types'
import { ReserveCheckChangeState, ReserveChecksState } from './types'

/**
 * 予約リストのapi hoooks
 * @param axisDate
 * @returns
 */
export function useReserveMatrix(
	axisDate: Date,
): [ReserveMatrixData | null, boolean, Error | null] {
	const [reserveMatrix, setReserveMatrix] = useState<ReserveMatrixData | null>(
		null,
	)
	const [isLoading, setLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		setLoading(true)
		getReserveMatrix()
			.then((e) => {
				setReserveMatrix(e)
			})
			.catch((e) => {
				setError(e)
			})
			.finally(() => setLoading(false))
	}, [axisDate])

	return [reserveMatrix, isLoading, error]
}

export function useStateWithReserveChecks(): [
	ReserveChecksState,
	(e: React.ChangeEvent<HTMLInputElement>) => void,
	React.Dispatch<React.SetStateAction<ReserveChecksState>>,
] {
	const [selects, setSelects] = useStateWithInputChecks()
	const [reserveSelects, setReserveSelects] = useState<ReserveChecksState>({})

	useEffect(() => {
		const tmpReserveSelects = Object.entries(selects).reduce(
			(pre, [key, value]) => {
				if (!value) {
					return pre
				}
				const [dateAxisIndex, timeAxisIndex] = extractEmptyIndex(key)
				pre[key] = {
					...value,
					dateAxisIndex,
					timeAxisIndex,
				}
				return pre
			},
			{} as ReserveChecksState,
		)
		setReserveSelects(tmpReserveSelects)
	}, [selects])
	return [reserveSelects, setSelects, setReserveSelects]
}
