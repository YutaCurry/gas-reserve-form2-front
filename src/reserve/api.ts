import axios from 'axios'
import { isReserveMatrix } from './types'

export async function getReserveMatrix(axisDate: Date = new Date()) {
	try {
		const res = await axios.get(
			`${process.env
				.REACT_APP_GET_RESERVE_MATRIX_URL!}?axisDateTime=${axisDate.getTime()}`,
		)
		return isReserveMatrix(res.data) ? res.data : null
	} catch (e) {
		return null
	}
}

export interface ReserveTime {
	startTime: string
	endTime: string
	date: string
}
export interface CreateCalEventsProps {
	email: string
	name: string
	reserveTimes: ReserveTime[]
	menu: string
}
export async function createCalEvents(
	axisDate: Date,
	body: CreateCalEventsProps,
) {
	try {
		const res = await axios.post(process.env.REACT_APP_CREATE_CAL_URL!, {
			axisDateTime: axisDate.getTime(),
			jsonProps: JSON.stringify(body),
		})
		return res.data as boolean
	} catch (e) {
		return false
	}
}
