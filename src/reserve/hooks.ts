import axios from 'axios'
import { useEffect, useState } from 'react'
import { getReserveMatrix } from './api'
import { isReserveMatrix, ReserveMatrix } from './types'

const dataClassName = 'reserveData'
let currCalendars: ReserveMatrix | null = null
const axisDate = new Date()
const RESERVE_MATRIX_DATE_LIMIT = 30

// process.env.REACT_APP_CREATE_CAL_URL

export function useReserveMatrix(
	axisDate: Date = new Date(),
): [ReserveMatrix | null, boolean] {
	const [reserveMatrix, setReserveMatrix] = useState<ReserveMatrix | null>(null)
	const [isLoading, setLoading] = useState(false)

	useEffect(() => {
		setLoading(true)
		getReserveMatrix()
			.then((e) => {
				setReserveMatrix(e)
			})
			.catch((e) => {
				console.warn({ e })
				setReserveMatrix(null)
			})
			.finally(() => setLoading(false))
	}, [axisDate])

	return [reserveMatrix, isLoading]
}

/**
 * 選択クリアイベント処理。
 */
const onSelectClearClickListener = (e) => {
	Array.from(document.getElementsByClassName('reserveDataCheck')).forEach(
		(e2) => (e2.checked = false),
	)
}

/**
 * 予約リスト作成。
 */
function createReserveMatrix(
	currCalendars: ReserveMatrix,
	pageLinkNum: number,
	startDateOffsetIndex: number,
	endDateOffsetIndexExclusive: number,
) {
	const { reserveMatrix } = currCalendars

	const dl = document.createElement('dl')
	dl.className = 'reserveDate'
	dl.dataset.pageLinkNum = pageLinkNum
	dl.classList.add('pageLinkData')

	const matrixTimeDataHeaderScroll = document.createElement('dl')
	matrixTimeDataHeaderScroll.className = 'matrixTimeDataHeaderScroll'

	// 時間軸
	const ddMatrixTimeDataHeader = document.createElement('dd')
	matrixTimeDataHeaderScroll.append(ddMatrixTimeDataHeader)
	ddMatrixTimeDataHeader.className = 'matrixTimeDataHeader'
	reserveMatrix.timeAxis.forEach(([startTime, endTime], i) => {
		const el = document.createElement('dt')
		el.className = 'time'
		el.style = `
        grid-column: ${i + 1} / ${i + 2};
        grid-row: 1 / 2;
      `
		el.innerHTML = `<span>${startTime}-<br>${endTime}</span>`
		ddMatrixTimeDataHeader.appendChild(el)
	})
	dl.appendChild(matrixTimeDataHeaderScroll)

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

/**
 * 予約可能リストをレンダリングする。
 *
 * @param calendars(object) reserveMatrix()の返却値。
 */
function onReserveMatrix(calendars: ReserveMatrix) {
	currCalendars = calendars

	if (currCalendars.maintenceFlag) {
		document.getElementById('require')!.style.display = 'none'
		document.getElementsByClassName('reserveContainer')[0].style.display =
			'none'
		document.getElementsByClassName('maintenance')[0].style.display = 'block'
		return
	}
	document.getElementsByClassName('maintenance')[0].style.display = 'none'

	const { reserveMatrix, menuItems } = currCalendars

	// --- メニュー追加
	const menuItemTags = menuItems.map((e) => {
		const menuOptionTag = document.createElement('option')
		menuOptionTag.value = e.id
		menuOptionTag.text = `${e.name}(${e.miniutes}分)`
		return menuOptionTag
	})
	const menuTag = document.getElementById('menu')
	while (menuTag!.firstChild) {
		menuTag!.removeChild(menuTag!.firstChild)
	}
	menuTag!.append(...menuItemTags)

	// --- 予約可能リストのレンダリング
	const pageNum = Math.floor(
		reserveMatrix.dateAxis.length / RESERVE_MATRIX_DATE_LIMIT,
	)
	const reserveMatrixList = [...Array(pageNum).keys()].map((e, i) => {
		return createReserveMatrix(
			currCalendars!,
			i,
			i * RESERVE_MATRIX_DATE_LIMIT,
			(i + 1) * RESERVE_MATRIX_DATE_LIMIT,
		)
	})

	const reserveMatrixNode = document.getElementById('reserveMatrix')
	while (reserveMatrixNode!.firstChild) {
		reserveMatrixNode!.removeChild(reserveMatrixNode!.firstChild)
	}
	reserveMatrixList.forEach((e) => reserveMatrixNode!.appendChild(e))

	function togglePageLinkNum(pageLinkNum: number) {
		// 一旦すべて非表示
		const pageLinkData = document.getElementsByClassName('pageLinkData')
		Array.from(pageLinkData).forEach((e) => (e.style.display = 'none'))
		Array.from(pageLinkData).forEach((e2) => {
			if (e2.dataset.pageLinkNum == pageLinkNum) {
				e2.style.display = 'grid'
			}
		})
		const pageLink = document.getElementsByClassName('pageLink')
		Array.from(pageLink).forEach((e) => e.classList.remove('foucus'))
		Array.from(pageLink)
			.find((e) => e.dataset.pageLinkNum == pageLinkNum)
			.classList.add('foucus')
	}

	function onPageLinkClickListener(e) {
		e.preventDefault()

		const pageLinkNum = e.currentTarget.dataset.pageLinkNum
		togglePageLinkNum(pageLinkNum)
	}

	const pageLinks = [...Array(pageNum).keys()].map((e, i) => {
		const pageLink = document.createElement('a')
		pageLink.className = 'pageLink'
		pageLink.dataset.pageLinkNum = String(i)

		const dateTimeStr =
			reserveMatrix.dateAxis[(i + 1) * RESERVE_MATRIX_DATE_LIMIT - 1]
		const dateDetail = reserveMatrix.dateDetail[dateTimeStr]
		const tailDate = `...${dateDetail.dateStr}(${dateDetail.dayOfWeek})`
		pageLink.text = tailDate
		pageLink.addEventListener('click', onPageLinkClickListener)
		return pageLink
	})
	const pageLinkSection = document.getElementById('pageLinkSection')!
	while (pageLinkSection.children.length > 0) {
		pageLinkSection.removeChild(pageLinkSection.firstChild)
	}

	pageLinkSection.append(...pageLinks)

	togglePageLinkNum(0)

	document.getElementsByClassName('loaderContainer')[0].hidden = true

	document
		.getElementById('send')!
		.removeEventListener('click', onSendClickListener)
	document
		.getElementById('send')!
		.addEventListener('click', onSendClickListener)
	document
		.getElementById('selectClear')!
		.removeEventListener('click', onSelectClearClickListener)
	document
		.getElementById('selectClear')!
		.addEventListener('click', onSelectClearClickListener)
}

// google.script.run
// 	.withSuccessHandler(onReserveMatrix)
// 	.getReserveMatrixOuter(axisDate.getTime())
