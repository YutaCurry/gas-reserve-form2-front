import { useEffect, useState } from 'react'
import { getReserveMatrix } from '../api'
import { ReserveMatrixData } from '../types'

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
