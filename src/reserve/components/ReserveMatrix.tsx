import { ReserveChecksState } from '../hooks/types'
import { ReserveMatrixData } from '../types'
import { DateCell } from './DateCell'
import { EmptyCell } from './EmptyCell'
import { ExistCell } from './ExistCell'
import { TimeCell } from './TimeCell'

export const RESERVE_MATRIX_DATE_LIMIT = 30
const dataClassName = 'reserveData'

export interface ReserveMatrixProps {
	currCalendars: ReserveMatrixData | null
	pageLinkNum: number
	startDateOffsetIndex: number
	endDateOffsetIndexExclusive: number
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
	selects = {},
	onChange = () => null,
}: ReserveMatrixProps) {
	if (!currCalendars) {
		console.log('empty render')
		return <></>
	}
	console.log('ReserveMatrix render', { pageLinkNum })
	const { reserveMatrix } = currCalendars
	const dl = (
		<dl className='reserveDate pageLinkData' data-pagelinknum={pageLinkNum}>
			<dl className='matrixTimeDataHeaderScroll'>
				{/* // 時間軸 */}
				<dd className='matrixTimeDataHeader'>
					<>
						{reserveMatrix.timeAxis.map(([startTime, endTime], i) => (
							<TimeCell
								key={`TimeCell_${i}`}
								gridColumn={`${i + 1} / ${i + 2}`}
								gridRow='1 / 2'
								startTime={startTime}
								endTime={endTime}
							/>
						))}
						{/* // 予約可能リストのレンダリング */}
						{Object.entries(reserveMatrix.data).map(([date, times], i) => (
							<EmptyCell
								key={`EmptyCells_${i}`}
								times={times}
								date={date}
								startDateOffsetIndex={startDateOffsetIndex}
								endDateOffsetIndexExclusive={endDateOffsetIndexExclusive}
								reserveMatrix={reserveMatrix}
								dataClassName={dataClassName}
								selects={selects}
								onChange={onChange}
							/>
						))}
						{/* // 予約不可能リストのレンダリング */}
						{[...Array(reserveMatrix.dateAxis.length)].map(
							(_, dateAxisIndex) => (
								<ExistCell
									key={`ExistCells_${dateAxisIndex}`}
									dateAxisIndex={dateAxisIndex}
									startDateOffsetIndex={startDateOffsetIndex}
									endDateOffsetIndexExclusive={endDateOffsetIndexExclusive}
									reserveMatrix={reserveMatrix}
								/>
							),
						)}
					</>
				</dd>
			</dl>
			{/* // 日付軸 */}
			<dd className="matrixDateHeader">
				<dl className="matrixSpace" />
				{slicedDateAxis.map((curr, i) => (
					<DateCell
						key={`DateCell_${i}`}
						curr={curr}
						reserveMatrix={reserveMatrix}
						gridRow={`${i + 2} / ${i + 3}`}
					/>
				))}
			</dd>
		</dl>
	)

	return dl
}
