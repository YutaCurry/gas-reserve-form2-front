export interface TimeCellProps {
	gridColumn: string
	gridRow: string
	startTime: string
	endTime: string
}

export function TimeCell({
	gridColumn,
	gridRow,
	startTime,
	endTime,
}: TimeCellProps) {
	return (
		<dt className="time" style={{ gridColumn, gridRow }}>
			<span>
				{startTime}-<br />
				{endTime}
			</span>
		</dt>
	)
}
