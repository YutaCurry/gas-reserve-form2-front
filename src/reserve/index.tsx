// import style from './style.css'

import { faRefresh } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import {
	useStateWithInputChange,
	useStateWithInputChecks,
	useStateWithSelectChange,
} from '../util/hooks'
import { createCalEvents, CreateCalEventsProps, ReserveTime } from './api'
import { Menu, PageLink, ReserveMatrix } from './components'
import { onCreateCalendarEvent, showMessage } from './funcs'
import { useReserveMatrix } from './hooks'
import './style.css'
const RESERVE_MATRIX_DATE_LIMIT = 30

export function Reserve() {
	const [axisDate, setAxisDate] = useState(new Date())
	const [currCalendars, isLoading, error] = useReserveMatrix(axisDate)

	const [isPostLoading, setPostLoading] = useState(false)
	const [email, setEmail] = useStateWithInputChange()
	const [name, setName] = useStateWithInputChange()

	const [menuState, setMenu, setMenuValue] = useStateWithSelectChange()
	const [reserveSelects, setReserveSelects] = useStateWithInputChecks()

	useEffect(() => {
		if (!error) {
			return
		}
		console.warn({ error })
	}, [error])

	useEffect(() => {
		const menuItem = currCalendars?.menuItems[0]
		setMenuValue(
			menuItem
				? {
						value: menuItem.id,
						text: `${menuItem.name}(${menuItem.miniutes}分)`,
				  }
				: {
						value: '',
						text: '',
				  },
		)
	}, [currCalendars, setMenuValue])

	/**
	 * 選択クリアイベント処理。
	 */
	function onSelectClearClickListener(
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
	) {
		Array.from(document.getElementsByClassName('reserveDataCheck')).forEach(
			(e2) => {
				if (e2 instanceof HTMLInputElement) e2.checked = false
			},
		)
	}

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

		console.log('menuState', { menuState })
		const menuItem = currCalendars!.menuItems.find(
			(e) => e.id === menuState.value,
		)
		if (!menuItem) {
			showMessage('予約できませんでした。選択されたメニューがありません。')
			setPostLoading(false)
			return
		}

		const requireCells = menuItem.miniutes / timeUnitOfCell
		const menuName = menuState.value

		// 予約時間
		const dataClassName = 'reserveData'
		const dataTags = Array.from(
			document.getElementsByClassName(`${dataClassName}Check`),
		)
		interface DateAxisType {
			checkedTag: HTMLInputElement
			dateAxisIndex: number
			timeAxisIndex: number
		}
		const dataChecks = dataTags
			.filter((tag): tag is HTMLInputElement => tag instanceof HTMLInputElement)
			.filter((tag) => tag.checked)
			.map((checkedTag) => {
				return {
					checkedTag,
					...checkedTag.dataset,
				} as DateAxisType
			})

		// 予約時間チェック(同日か)
		const dateAxisIndexes = new Set(dataChecks.map((e) => e.dateAxisIndex))
		if (dateAxisIndexes.size > 1) {
			showMessage('予約できませんでした。予約は同じ日でなければなりません。')
			setPostLoading(false)
			return
		}

		// 予約時間チェック(指定時間であるか)
		if (dataChecks.length !== requireCells) {
			showMessage(
				`予約できませんでした。"${menuName}"の予約は${requireCells}枠分を選択してください。`,
			)
			setPostLoading(false)
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
			setPostLoading(false)
			return
		}

		// 予約時間変換
		const reserveTimes: ReserveTime[] = [
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
			email,
			name,
			reserveTimes,
			menu: menuName,
		}

		if (body.email === '') {
			showMessage('予約できませんでした。メールアドレスを入力してください。')
			setPostLoading(false)
			return
		}

		if (body.name === '') {
			showMessage('予約できませんでした。お名前を入力してください。')
			setPostLoading(false)
			return
		}

		showMessage('', false)

		try {
			const result = await createCalEvents(axisDate, body)
			onCreateCalendarEvent(result)
		} catch (e) {
			onCreateCalendarEvent(false)
			console.warn({ e })
		} finally {
			setAxisDate(new Date())
			setPostLoading(false)
		}
	}

	let reserveMatrixes: JSX.Element[] = []
	if (currCalendars) {
		const { reserveMatrix } = currCalendars
		const pageNum = Math.floor(
			reserveMatrix.dateAxis.length / RESERVE_MATRIX_DATE_LIMIT,
		)

		reserveMatrixes = [...Array(pageNum).keys()].map((e, i) => {
			return (
				<ReserveMatrix
					key={`ReserveMatrix_${i}`}
					currCalendars={currCalendars}
					pageLinkNum={i}
					startDateOffsetIndex={i * RESERVE_MATRIX_DATE_LIMIT}
					endDateOffsetIndexExclusive={(i + 1) * RESERVE_MATRIX_DATE_LIMIT}
					selects={reserveSelects}
					onChange={setReserveSelects}
				/>
			)
		})
	}
	return (
		<main>
			<section>
				<span
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					<h1>カット予約フォーム</h1>
					<FontAwesomeIcon
						className={'refresh'}
						icon={faRefresh}
						style={{
							fontSize: '1.5rem',
							paddingLeft: '0.5rem',
							paddingRight: '0.5rem',
							color: isLoading ? 'rgb(58, 70, 59)' : 'inherit',
						}}
						onClick={() => !isLoading && setAxisDate(new Date())}
					/>
				</span>
				<span id="msgLabel" />
			</section>
			{error ? (
				<section>
					<span>予約カレンダーの取得に失敗しました。</span>
				</section>
			) : currCalendars?.maintenceFlag ? (
				<section className="maintenance">
					<span>メンテナンス中です。</span>
				</section>
			) : (
				<>
					<section
						id="require"
						style={{
							display: 'flex',
							justifyContent: 'space-evenly',
							flexWrap: 'wrap',
						}}
					>
						<span
							style={{
								display: 'flex',
								flexDirection: 'column',
								flexBasis: '40%',
							}}
						>
							<label htmlFor="email">メールアドレス</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={setEmail}
							/>
						</span>
						<span
							style={{
								display: 'flex',
								flexDirection: 'column',
								flexBasis: '40%',
							}}
						>
							<label id="nameLabel" htmlFor="name">
								お名前
							</label>
							<input id="name" type="text" value={name} onChange={setName} />
						</span>
						<span
							style={{
								display: 'flex',
								flexDirection: 'column',
								flexBasis: '40%',
							}}
						>
							<label id="menuLabel" htmlFor="menu">
								メニュー
							</label>
							<Menu
								currCalendars={currCalendars}
								selectedId={menuState.value}
								disabled={isLoading}
								onChange={setMenu}
							/>
						</span>
					</section>

					<section className="reserveContainer">
						<article id="reserveMatrix">
							<PageLink currCalendars={currCalendars}>
								{reserveMatrixes}
							</PageLink>
						</article>
						<section id="btnSection">
							<button
								id="send"
								onClick={onSendClickListener}
								disabled={isLoading}
							>
								予約
							</button>
							<button
								id="selectClear"
								onClick={onSelectClearClickListener}
								disabled={isLoading}
							>
								選択クリア
							</button>
						</section>
						{(isPostLoading || isLoading) && (
							<section className="loaderContainer">
								<div className="loader">Loading...</div>
								<span>お待ちください。</span>
							</section>
						)}
					</section>
				</>
			)}
		</main>
	)
}
