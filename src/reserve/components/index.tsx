import { ReserveMatrix } from '../types'

export interface ReserveMatrixComponentProps {
	currCalendars: ReserveMatrix
	pageLinkNum: number
	startDateOffsetIndex: number
	endDateOffsetIndexExclusive: number
}

/**
 * 予約リスト作成。
 */
export function ReserveMatrixComponent({
	currCalendars: { reserveMatrix },
	pageLinkNum,
	startDateOffsetIndex,
	endDateOffsetIndexExclusive,
}: ReserveMatrixComponentProps) {
	const dl = (
		<dl className='reserveDate' data-pageLinkNum={pageLinkNum}>
			<dl className='matrixTimeDataHeaderScroll'>
				{/* // 時間軸 */}
				<dd className='matrixTimeDataHeader'>
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
				</dd>
			</dl>
		</dl>
	)

	// 日付軸
	const ddMatrixDateHeader = document.createElement('dd')
	ddMatrixDateHeader.classList.add('matrixDateHeader')

	const ddMatrixSpace = document.createElement('dl')
	ddMatrixSpace.className = 'matrixSpace'
	ddMatrixDateHeader.appendChild(ddMatrixSpace)

	const slicedDateAxis = reserveMatrix.dateAxis.slice(
		RESERVE_MATRIX_DATE_LIMIT * pageLinkNum,
		RESERVE_MATRIX_DATE_LIMIT * (pageLinkNum + 1),
	)
	slicedDateAxis.forEach((curr, i) => {
		const el = document.createElement('dt')
		el.classList.add('date')
		el.style = `
        grid-row: ${i + 2} / ${i + 3};
      `

		const dateDetail = reserveMatrix.dateDetail[curr]
		if (dateDetail.isHoliday) {
			el.classList.add('holiday')
		}
		el.innerHTML = `<span>${dateDetail.dateStr}&#040;${dateDetail.dayOfWeek}&#041;</span>`
		ddMatrixDateHeader.appendChild(el)
	})
	dl.appendChild(ddMatrixDateHeader)

	// 予約可能リストのレンダリング
	Object.entries(reserveMatrix.data).forEach(([date, times]) => {
		if (
			!(
				times.dateAxisIndex >= startDateOffsetIndex &&
				times.dateAxisIndex < endDateOffsetIndexExclusive
			)
		) {
			return
		}

		times.times.forEach((time) => {
			const el = document.createElement('dd')
			el.classList.add('data')
			const dateDetail = reserveMatrix.dateDetail[date]
			if (dateDetail.isHoliday) {
				el.classList.add('holiday')
			}

			el.style = `
          grid-column: ${time.timeAxisIndex! + 1} / ${time.timeAxisIndex! + 2};
          grid-row: ${times.dateAxisIndex + 2 - startDateOffsetIndex} / ${
				times.dateAxisIndex + 3 - startDateOffsetIndex
			};
        `

			const emptyId = `empty-${times.dateAxisIndex}-${time.timeAxisIndex}`
			el.innerHTML = `
          <div class='${dataClassName}'>
            <input id='${emptyId}' class='${dataClassName}Check'
              data-date-axis-index='${times.dateAxisIndex}' data-time-axis-index='${time.timeAxisIndex}' type="checkbox" />
            <label for='${emptyId}'></label>
          </div>`
			ddMatrixTimeDataHeader.appendChild(el)
		})
	})

	// 予約不可能リストのレンダリング
	;[...Array(reserveMatrix.dateAxis.length)].forEach((_, dateAxisIndex) => {
		if (
			!(
				dateAxisIndex >= startDateOffsetIndex &&
				dateAxisIndex < endDateOffsetIndexExclusive
			)
		) {
			return
		}
		;[...Array(reserveMatrix.timeAxis.length)].forEach((_, timeAxisIndex) => {
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
				return
			}

			const el = document.createElement('dd')
			el.classList.add('data')
			el.classList.add('empty')
			el.style = `
          grid-column: ${timeAxisIndex + 1} / ${timeAxisIndex + 2};
          grid-row: ${dateAxisIndex + 2 - startDateOffsetIndex} / ${
				dateAxisIndex + 3 - startDateOffsetIndex
			};
        `
			el.dataset.pageLinkNum = Math.floor(
				dateAxisIndex / RESERVE_MATRIX_DATE_LIMIT,
			)
			ddMatrixTimeDataHeader.appendChild(el)
		})
	})

	return dl
}
