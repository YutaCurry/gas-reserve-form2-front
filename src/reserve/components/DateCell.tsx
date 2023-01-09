import { DateDetail } from './types'

export interface DateCellsProps {
	dateDetail: DateDetail
	slicedDateAxis: string[]
}

export function DateCells({ dateDetail, slicedDateAxis }: DateCellsProps) {
	const els = slicedDateAxis.map((curr, i) => {
		const dateDetailValue = dateDetail[curr]
		return (
			<dt
				key={`DateCell_${i}`}
				className={`date ${dateDetailValue.isHoliday && 'holiday'}`}
				style={{ gridRow: `${i + 2} / ${i + 3}` }}
			>
				<span>
					{dateDetailValue.dateStr}&#040;{dateDetailValue.dayOfWeek}&#041;
				</span>
			</dt>
		)
	})

	return <>{els}</>
}
