import { useEffect, useState } from 'react'
import { getReserveMatrix } from './api'
import { ReserveMatrixData } from './types'

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

export type ValueElement = HTMLInputElement | HTMLSelectElement
/**
 * useStateのHTMLInputElement ver
 * @param initialValue
 * @returns
 */
export function useStateWithInputChange(
	initialValue = '',
): [string, (e: React.ChangeEvent<ValueElement>) => void] {
	const [what, setWhat] = useState(initialValue)

	function onChangeEvent(event: React.ChangeEvent<ValueElement>) {
		setWhat(event.target.value)
	}
	return [what, onChangeEvent]
}

type SelectValue = string
type SelectText = string
export function useStateWithSelectChange(
	initialValue = '',
): [
	SelectValue,
	SelectText,
	(e: React.ChangeEvent<HTMLSelectElement>) => void,
] {
	const [what, setWhat] = useState(initialValue)
	const [textWhat, setTextWhat] = useState('')

	function onChangeEvent(event: React.ChangeEvent<HTMLSelectElement>) {
		setWhat(event.target.value)
		setTextWhat(event.target.selectedOptions[0].text)
	}
	return [what, textWhat, onChangeEvent]
}
