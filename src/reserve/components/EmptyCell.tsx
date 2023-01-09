import { ChecksState } from 'react-utils/dist/hooks'
import { createEmptyIndexKey } from '../funcs'
import { DateDetail, DateType } from './types'

export interface EmptyCellsProps {
	selects: ChecksState
	dateDetail: DateDetail
	onChange?: React.ChangeEventHandler<HTMLInputElement>
	canReserveData: DateType
	startDateOffsetIndex: number
}

export function EmptyCells({
	dateDetail,
	selects,
	onChange = () => null,
	canReserveData,
	startDateOffsetIndex,
}: EmptyCellsProps) {
	const canReservedList: JSX.Element[] = Object.entries(canReserveData).flatMap(
		([date, times]) => {
			const dateDetailValue = dateDetail[date]
			const timesEl: JSX.Element[] = times.times.map((time, i) => {
				const emptyId = createEmptyIndexKey(
					times.dateAxisIndex,
					time.timeAxisIndex,
				)

				const gridRow = `${times.dateAxisIndex + 2 - startDateOffsetIndex} / ${
					times.dateAxisIndex + 3 - startDateOffsetIndex
				}`
				// console.log(`EmptyCell_${emptyId}_${i}`)
				// console.log({ emptyId, selects })
				const el = (
					<dd
						key={`EmptyCell_${emptyId}`}
						className={`data ${dateDetailValue.isHoliday && 'holiday'}`}
						style={{
							gridColumn: `${time.timeAxisIndex! + 1} / ${
								time.timeAxisIndex! + 2
							}`,
							gridRow,
						}}
					>
						<div>
							<input
								id={emptyId}
								className='reserveDataCheck'
								type="checkbox"
								checked={selects[emptyId]?.checked}
								onChange={onChange}
							/>
							<label htmlFor={emptyId} />
						</div>
					</dd>
				)

				return el
			})
			return timesEl
		},
	)

	return <>{canReservedList}</>
}
