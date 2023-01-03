import { ReserveMatrixData } from '../types'

const RESERVE_MATRIX_DATE_LIMIT = 30
const dataClassName = 'reserveData'

export interface ReserveMatrixProps {
	currCalendars: ReserveMatrixData
	pageLinkNum: number
	startDateOffsetIndex: number
	endDateOffsetIndexExclusive: number
}

/**
 * 予約リスト作成。
 */
export function ReserveMatrix({
	currCalendars: { reserveMatrix },
	pageLinkNum,
	startDateOffsetIndex,
	endDateOffsetIndexExclusive,
}: ReserveMatrixProps) {
	const slicedDateAxis = reserveMatrix.dateAxis.slice(
		RESERVE_MATRIX_DATE_LIMIT * pageLinkNum,
		RESERVE_MATRIX_DATE_LIMIT * (pageLinkNum + 1),
	)
	const dl = (
		<dl className='reserveDate pageLinkData' data-pageLinkNum={pageLinkNum}>
			<dl className='matrixTimeDataHeaderScroll'>
				{/* // 時間軸 */}
				<dd className='matrixTimeDataHeader'>
					<>
						{reserveMatrix.timeAxis.map(([startTime, endTime], i) => (
							<dt
								className="time"
								style={{ gridColumn: `${i + 1} / ${i + 2}`, gridRow: '1 / 2' }}
							>
								<span>
									{startTime}-<br />
									{endTime}
								</span>
							</dt>
						))}
						{/* // 予約可能リストのレンダリング */}
						{Object.entries(reserveMatrix.data).map(([date, times]) => {
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
											gridColumn: `${time.timeAxisIndex! + 1} / ${
												time.timeAxisIndex! + 2
											}`,
											gridRow: `${
												times.dateAxisIndex + 2 - startDateOffsetIndex
											} / ${times.dateAxisIndex + 3 - startDateOffsetIndex}`,
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

							return canReservedList
						})}
						{/* // 予約不可能リストのレンダリング */}
						{[...Array(reserveMatrix.dateAxis.length)].map(
							(_, dateAxisIndex) => {
								if (
									!(
										dateAxisIndex >= startDateOffsetIndex &&
										dateAxisIndex < endDateOffsetIndexExclusive
									)
								) {
									return <></>
								}

								const cannotReserveList = [
									...Array(reserveMatrix.timeAxis.length),
								].map((_, timeAxisIndex) => {
									const exist = Object.entries(reserveMatrix.data).find(
										([date, times]) => {
											if (
												reserveMatrix.dateAxis.indexOf(date) === dateAxisIndex
											) {
												if (
													times.times.find((e) => {
														return e.timeAxisIndex === timeAxisIndex
													})
												) {
													return true
												}
											}

											return false
										},
									)
									if (exist) {
										return <></>
									}

									const el = (
										<dd
											className="data empty"
											style={{
												gridColumn: `${timeAxisIndex + 1} / ${
													timeAxisIndex + 2
												}`,
												gridRow: `${
													dateAxisIndex + 2 - startDateOffsetIndex
												} / ${dateAxisIndex + 3 - startDateOffsetIndex}`,
											}}
											data-pageLinkNum={Math.floor(
												dateAxisIndex / RESERVE_MATRIX_DATE_LIMIT,
											)}
										/>
									)
									return el
								})

								return cannotReserveList
							},
						)}
					</>
				</dd>
			</dl>
			{/* // 日付軸 */}
			<dd className="matrixDateHeader">
				<dl className="matrixSpace" />
				{slicedDateAxis.map((curr, i) => {
					const dateDetail = reserveMatrix.dateDetail[curr]
					return (
						<dt
							className={`date ${dateDetail.isHoliday && 'holiday'}`}
							style={{ gridRow: `${i + 2} / ${i + 3}` }}
						>
							<span>
								{dateDetail.dateStr}&#040;{dateDetail.dayOfWeek}&#041;
							</span>
						</dt>
					)
				})}
			</dd>
		</dl>
	)

	return dl
}
