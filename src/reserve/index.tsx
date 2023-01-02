// import style from './style.css'

import { useRef, useState } from 'react'
import { createCalEvents, CreateCalEventsProps, ReserveTimes } from './api'
import { onCreateCalendarEvent, showMessage, useReserveMatrix } from './hooks'

export function Reserve() {
	const [axisDate, setAxisDate] = useState(new Date())
	const [currCalendars, isLoading] = useReserveMatrix()

	const [isPostLoading, setPostLoading] = useState(false)
	const menuRef = useRef<HTMLSelectElement>(null)

	/**
	 * 予約ボタンクリックイベント処理。
	 */
	async function onSendClickListener(
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
	) {
		setPostLoading(true)

		// --- 予約時間チェック(HOUR)
		// セルの時間単位
		const timeUnitOfCell = currCalendars!.periodMiniutes
		// const menuNode = document.getElementById('menu')

		// メニュー取得
		// const menuItem = currCalendars!.menuItems.find(
		// 	(e) => e.id === menuNode.value,
		// )
		const menuItem = menuRef.current
		if (!menuItem) {
			showMessage('予約できませんでした。選択されたメニューがありません。')
			setPostLoading(false)
			return
		}

		const requireCells = menuItem.miniutes / timeUnitOfCell
		// const menuName = menuNode!.selectedOptions[0].text
		const menuName = menuRef.current.selectedOptions[0].text

		// 予約時間
		const dataTags = Array.from(
			document.getElementsByClassName(`${dataClassName}Check`),
		)
		const dataChecks = dataTags
			.filter((tag) => tag.checked)
			.map((checkedTag) => {
				return {
					checkedTag: checkedTag,
					...checkedTag.dataset,
				}
			})

		// 予約時間チェック(同日か)
		const dateAxisIndexes = new Set(dataChecks.map((e) => e.dateAxisIndex))
		if (dateAxisIndexes.size > 1) {
			showMessage('予約できませんでした。予約は同じ日でなければなりません。')
			document.getElementsByClassName('loaderContainer')[0].hidden = true
			return
		}

		// 予約時間チェック(指定時間であるか)
		if (dataChecks.length !== requireCells) {
			showMessage(
				`予約できませんでした。"${menuName}"の予約は${requireCells}枠分を選択してください。`,
			)
			document.getElementsByClassName('loaderContainer')[0].hidden = true
			return
		}

		// 予約時間チェック(連続しているか)
		const timeAxisIndexes = dataChecks.map((e) => e.timeAxisIndex)
		timeAxisIndexes.sort((e, e2) => {
			if (Number(e) > Number(e2)) {
				return 1
			} else if (Number(e2) > Number(e)) {
				return -1
			} else {
				return 0
			}
		})
		const [seqValid] = timeAxisIndexes.reduce(
			(pre, curr) => {
				const [valid, preValue] = pre
				if (!valid) {
					return [false, -1]
				}

				if (preValue === curr) {
					return [true, curr]
				}

				return [curr - preValue === 1, curr]
			},
			[true, timeAxisIndexes[0]],
		)
		if (!seqValid) {
			showMessage(
				'予約できませんでした。予約は連続した時間でなければなりません。',
			)
			document.getElementsByClassName('loaderContainer')[0].hidden = true
			return
		}

		// 予約時間変換
		const reserveTimes: ReserveTimes = [
			{
				startTime: currCalendars!.reserveMatrix.timeAxis[timeAxisIndexes[0]][0],
				endTime:
					currCalendars!.reserveMatrix.timeAxis[
						timeAxisIndexes.slice(-1)[0]
					][1],
				date: currCalendars!.reserveMatrix.dateAxis[
					dataChecks[0].dateAxisIndex
				],
			},
		]

		const body: CreateCalEventsProps = {
			email: document.getElementById('email')!.nodeValue!,
			name: document.getElementById('name')!.nodeValue!,
			reserveTimes,
			menu: menuName,
		}

		if (body.email === '') {
			showMessage('予約できませんでした。メールアドレスを入力してください。')
			document.getElementsByClassName('loaderContainer')[0].hidden = true
			return
		}

		if (body.name === '') {
			showMessage('予約できませんでした。お名前を入力してください。')
			document.getElementsByClassName('loaderContainer')[0].hidden = true
			return
		}

		showMessage('', false)

		try {
			await createCalEvents(axisDate, body)
			onCreateCalendarEvent(true)
		} catch (e) {
			onCreateCalendarEvent(false)
			console.warn({ e })
		} finally {
			setAxisDate(new Date())
		}
		// google.script.run
		// 	.withSuccessHandler(onCreateCalendarEvent)
		// 	.createCalendarEventOuter(axisDate.getTime(), JSON.stringify(body))
	}

	return (
		<main>
			<section>
				<h1>カット予約フォーム</h1>
				<span id="msgLabel" />
			</section>
			<section id="require">
				<label htmlFor="email">メールアドレス</label>
				<input id="email" type="email" />
				<label id="nameLabel" htmlFor="name">
					お名前
				</label>
				<input id="name" type="text" />
				<label id="menuLabel" htmlFor="menu">
					メニュー
				</label>
				<select id="menu" ref={menuRef} />
				<section id="pageLinkSection" />
			</section>
			<section className="reserveContainer">
				<article id="reserveMatrix" />
				<section id="btnSection">
					<button id="send" onClick={onSendClickListener}>
						予約
					</button>
					<button id="selectClear">選択クリア</button>
				</section>
				{(isPostLoading || isLoading) && (
					<section className="loaderContainer">
						<div className="loader">Loading...</div>
						<span>お待ちください。</span>
					</section>
				)}
			</section>
			<section className="maintenance">
				<span>メンテナンス中です。</span>
			</section>
		</main>
	)
}
