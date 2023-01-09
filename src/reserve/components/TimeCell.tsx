export interface TimeCellsProps {
	timeAxis: string[][]
}

export function TimeCells({ timeAxis }: TimeCellsProps) {
	const els = timeAxis.map(([startTime, endTime], i) => {
		return (
			<dt
				key={`TimeCell_${i}`}
				className="time"
				style={{ gridColumn: `${i + 1} / ${i + 2}`, gridRow: '1 / 2' }}
			>
				<span>
					{startTime}-<br />
					{endTime}
				</span>
			</dt>
		)
	})
	return <>{els}</>
}
