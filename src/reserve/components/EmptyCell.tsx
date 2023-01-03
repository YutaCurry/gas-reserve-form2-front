import { DataTypeValue, ReserveMatrixData } from '../types'

export interface EmptyCellProps {
	times: DataTypeValue
	startDateOffsetIndex: number
	endDateOffsetIndexExclusive: number
	reserveMatrix: ReserveMatrixData['reserveMatrix']
	date: string
	dataClassName: string
}

export function EmptyCell({
	times,
	startDateOffsetIndex,
	endDateOffsetIndexExclusive,
	reserveMatrix,
	date,
	dataClassName,
}: EmptyCellProps) {
	if (
		!(
			times.dateAxisIndex >= startDateOffsetIndex &&
			times.dateAxisIndex < endDateOffsetIndexExclusive
		)
	) {
		return <></>
	}

	const dateDetail = reserveMatrix.dateDetail[date]

	const canReservedList: JSX.Element[] = times.times.map((time) => {
		const emptyId = `empty-${times.dateAxisIndex}-${time.timeAxisIndex}`

		const el = (
			<dd
				className={`data ${dateDetail.isHoliday && 'holiday'}`}
				style={{
					gridColumn: `${time.timeAxisIndex! + 1} / ${time.timeAxisIndex! + 2}`,
					gridRow: `${times.dateAxisIndex + 2 - startDateOffsetIndex} / ${
						times.dateAxisIndex + 3 - startDateOffsetIndex
					}`,
				}}
			>
				<div className={dataClassName}>
					<input
						id={emptyId}
						className={`${dataClassName}Check`}
						data-date-axis-index={times.dateAxisIndex}
						data-time-axis-index={time.timeAxisIndex}
						type="checkbox"
					/>
					<label htmlFor={emptyId} />
				</div>
			</dd>
		)

		return el
	})

	return <>{canReservedList}</>
}