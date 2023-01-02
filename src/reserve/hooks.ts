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
