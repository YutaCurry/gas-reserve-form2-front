export interface DataTypeValue {
	times: {
		startTime: string
		endTime: string
		timeAxisIndex: number | undefined
	}[]
	dateAxisIndex: number
}
export type DateType = Record<string, DataTypeValue>

export interface DetailValue {
	dateStr: string
	dayOfWeek: string
	isHoliday: boolean
}
export type DateDetail = Record<string, DetailValue>

export interface ReserveMatrixData {
	reserveMatrix: {
		dateAxis: string[]
		timeAxis: string[][]
		data: DateType
		dateDetail: DateDetail
	}
	periodMiniutes: number
	menuItems: {
		id: string
		name: string
		miniutes: number
	}[]
	maintenceFlag: boolean
}

const reserveMatrixObj: ReserveMatrixData = {
	reserveMatrix: {
		dateAxis: [],
		timeAxis: [],
		data: {},
		dateDetail: {},
	},
	periodMiniutes: 0,
	menuItems: [],
	maintenceFlag: false,
}

// rome-ignore lint/suspicious/noExplicitAny: <explanation>
export function isReserveMatrix(data: any): data is ReserveMatrixData {
	const properties = Object.keys(reserveMatrixObj)
	return properties.every((e) => e in data)
}
