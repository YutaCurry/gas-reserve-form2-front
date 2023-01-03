import { useEffect, useState } from 'react'
import { getReserveMatrix } from './api'
import { ReserveMatrixData } from './types'

export function useReserveMatrix(
	axisDate: Date,
): [ReserveMatrixData | null, boolean] {
	const [reserveMatrix, setReserveMatrix] = useState<ReserveMatrixData | null>(
		null,
	)
	const [isLoading, setLoading] = useState(false)

	useEffect(() => {
		setLoading(true)
		getReserveMatrix()
			.then((e) => {
				setReserveMatrix(e)
			})
			.catch((e) => {
				console.warn({ e })
				setReserveMatrix(null)
			})
			.finally(() => setLoading(false))
	}, [axisDate])

	return [reserveMatrix, isLoading]
}
