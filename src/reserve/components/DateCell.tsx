import { ReserveMatrixData } from '../types'

export interface DateCellProps {
	gridRow: string
	reserveMatrix: ReserveMatrixData['reserveMatrix']
	curr: string
}

export function DateCell({ gridRow, reserveMatrix, curr }: DateCellProps) {
	const dateDetail = reserveMatrix.dateDetail[curr]
	return (
		<dt
			className={`date ${dateDetail.isHoliday && 'holiday'}`}
			style={{ gridRow }}
		>
			<span>
				{dateDetail.dateStr}&#040;{dateDetail.dayOfWeek}&#041;
			</span>
		</dt>
	)
}
