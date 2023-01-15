import { ReserveChecksState } from '../hooks/types'
import { DateCells } from './DateCell'
import { EmptyCells } from './EmptyCell'
import { ExistCells } from './ExistCell'
import { TimeCells } from './TimeCell'
import { DateType, ReserveMatrixData } from './types'

export interface ReserveMatrixProps {
	currCalendars: ReserveMatrixData | null
	pageLinkNum: number
	canReserveData: DateType | undefined
	startDateOffsetIndex: number | undefined
	endDateOffsetIndexExclusive: number | undefined
	selects?: ReserveChecksState
	onChange?: React.ChangeEventHandler<HTMLInputElement>
	slicedDateAxis: string[]
}

/**
 * 予約リスト作成。
 */
export function ReserveMatrix({
	currCalendars,
	pageLinkNum,
	startDateOffsetIndex,
	endDateOffsetIndexExclusive,
	slicedDateAxis,
	canReserveData,
	selects = {},
	onChange = () => null,
}: ReserveMatrixProps) {
	if (
		!(
			currCalendars &&
			canReserveData &&
			startDateOffsetIndex !== undefined &&
			endDateOffsetIndexExclusive !== undefined
		)
	) {
		// console.log('empty render', {
		// 	currCalendars,
		// 	canReserveData,
		// 	startDateOffsetIndex,
		// 	endDateOffsetIndexExclusive,
		// })
		return <></>
	}
	// console.log('ReserveMatrix render', { pageLinkNum })
	const { reserveMatrix } = currCalendars
	const dl = (
		<dl className='reserveDate pageLinkData' data-pagelinknum={pageLinkNum}>
			<dl className='matrixTimeDataHeaderScroll'>
				{/* // 時間軸 */}
				<dd className='matrixTimeDataHeader'>
					<TimeCells timeAxis={reserveMatrix.timeAxis} />
					{/* // 予約可能リストのレンダリング */}
					<EmptyCells
						selects={selects}
						onChange={onChange}
						canReserveData={canReserveData}
						startDateOffsetIndex={startDateOffsetIndex}
						dateDetail={reserveMatrix.dateDetail}
					/>
					{/* // 予約不可能リストのレンダリング */}
					<ExistCells
						startDateOffsetIndex={startDateOffsetIndex}
						endDateOffsetIndexExclusive={endDateOffsetIndexExclusive}
						dateAxis={reserveMatrix.dateAxis}
						timeAxis={reserveMatrix.timeAxis}
						data={reserveMatrix.data}
					/>
				</dd>
			</dl>
			{/* // 日付軸 */}
			<dd className="matrixDateHeader">
				<dl className="matrixSpace" />
				<DateCells
					dateDetail={reserveMatrix.dateDetail}
					slicedDateAxis={slicedDateAxis}
				/>
			</dd>
		</dl>
	)

	return dl
}
