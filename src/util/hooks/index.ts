import { useState } from 'react'
import {
	CheckChangeState,
	ChecksState,
	SelectChangeState,
	ValueElement,
} from './types'

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

/**
 * useStateのHTMLSelectElement ver
 * @param initial
 * @returns
 */
export function useStateWithSelectChange(
	initial: SelectChangeState = {
		value: '',
		text: '',
	},
): [
	SelectChangeState,
	(e: React.ChangeEvent<HTMLSelectElement>) => void,
	React.Dispatch<React.SetStateAction<SelectChangeState>>,
] {
	const [what, setWhat] = useState(initial)

	function onChangeEvent(event: React.ChangeEvent<HTMLSelectElement>) {
		setWhat({
			value: event.target.value,
			text: event.target.selectedOptions[0].text,
		})
	}
	return [what, onChangeEvent, setWhat]
}

/**
 * useStateのCheckBox ver
 * @param initial
 * @returns
 */
export function useStateWithCheckChange(
	initial: CheckChangeState = {
		id: '',
		name: '',
		value: '',
		checked: false,
	},
): [CheckChangeState, (e: React.ChangeEvent<HTMLInputElement>) => void] {
	const [whatChangeState, setWhatChangeState] =
		useState<CheckChangeState>(initial)

	function onChangeEvent(event: React.ChangeEvent<HTMLInputElement>) {
		setWhatChangeState({
			id: event.target.id,
			name: event.target.name,
			value: event.target.value,
			checked: event.target.checked,
		})
	}
	return [whatChangeState, onChangeEvent]
}

/**
 * useStateの複数CheckBox ver
 */
export function useStateWithInputChecks(): [
	ChecksState,
	(e: React.ChangeEvent<HTMLInputElement>) => void,
] {
	const [checks, setChecks] = useState<ChecksState>({})

	function onChangeEvent(event: React.ChangeEvent<HTMLInputElement>) {
		console.log('check', { id: event.target.id, checked: event.target.checked })
		setChecks({
			...checks,
			id: {
				id: event.target.id,
				name: event.target.name,
				value: event.target.value,
				checked: event.target.checked,
			},
		})
	}
	return [checks, onChangeEvent]
}
