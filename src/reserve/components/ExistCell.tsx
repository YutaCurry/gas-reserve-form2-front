import { DateType } from './types'

export interface ExistCellsProps {
	startDateOffsetIndex: number
	endDateOffsetIndexExclusive: number
	timeAxis: string[][]
	dateAxis: string[]
	data: DateType
}

export function ExistCells({
	startDateOffsetIndex,
	endDateOffsetIndexExclusive,
	timeAxis,
	dateAxis,
	data,
}: ExistCellsProps) {
	// console.log('empty empty', {
	// 	startDateOffsetIndex,
	// 	endDateOffsetIndexExclusive,
	// })
	const cannotReserveList = dateAxis
		.filter(
			(_, dateAxisIndex) =>
				dateAxisIndex >= startDateOffsetIndex &&
				dateAxisIndex < endDateOffsetIndexExclusive,
		)
		.map((e, i): [string, number] => [e, i + startDateOffsetIndex])
		.flatMap(([date, dateAxisIndex]) => {
			return [...Array(timeAxis.length)].map((_, timeAxisIndex) => {
				const element = (
					<dd
						key={`ExistCell_${dateAxisIndex}_${timeAxisIndex}`}
						className="data empty"
						style={{
							gridColumn: `${timeAxisIndex + 1} / ${timeAxisIndex + 2}`,
							gridRow: `${dateAxisIndex + 2 - startDateOffsetIndex} / ${
								dateAxisIndex + 3 - startDateOffsetIndex
							}`,
						}}
					/>
				)

				const targetDate = data[date]
				if (!targetDate) {
					return element
				}
				const targetTime = targetDate.times.find(
					(e) => e.timeAxisIndex === timeAxisIndex,
				)

				if (!targetTime) {
					return element
				}

				return null
			})
		})
	return (
		<>
			{cannotReserveList.filter((e): e is NonNullable<typeof e> => e != null)}
		</>
	)
}
