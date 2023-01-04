import { ReserveMatrixData } from '../types'
import { RESERVE_MATRIX_DATE_LIMIT } from './ReserveMatrix'

export interface ExistCellProps {
	dateAxisIndex: number
	startDateOffsetIndex: number
	endDateOffsetIndexExclusive: number
	reserveMatrix: ReserveMatrixData['reserveMatrix']
}

export function ExistCell({
	dateAxisIndex,
	startDateOffsetIndex,
	endDateOffsetIndexExclusive,
	reserveMatrix,
}: ExistCellProps) {
	if (
		!(
			dateAxisIndex >= startDateOffsetIndex &&
			dateAxisIndex < endDateOffsetIndexExclusive
		)
	) {
		return <></>
	}

	const cannotReserveList = [...Array(reserveMatrix.timeAxis.length)].map(
		(_, timeAxisIndex) => {
			const exist = Object.entries(reserveMatrix.data).find(([date, times]) => {
				if (reserveMatrix.dateAxis.indexOf(date) === dateAxisIndex) {
					if (
						times.times.find((e) => {
							return e.timeAxisIndex === timeAxisIndex
						})
					) {
						return true
					}
				}

				return false
			})
			if (exist) {
				return null
			}

			const el = (
				<dd
					key={`ExistCell_${dateAxisIndex}_${timeAxisIndex}`}
					className="data empty"
					style={{
						gridColumn: `${timeAxisIndex + 1} / ${timeAxisIndex + 2}`,
						gridRow: `${dateAxisIndex + 2 - startDateOffsetIndex} / ${
							dateAxisIndex + 3 - startDateOffsetIndex
						}`,
					}}
					data-pagelinknum={Math.floor(
						dateAxisIndex / RESERVE_MATRIX_DATE_LIMIT,
					)}
				/>
			)
			return el
		},
	)

	return (
		<>
			{cannotReserveList.filter((e): e is NonNullable<typeof e> => e != null)}
		</>
	)
}
