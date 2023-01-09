// import style from './style.css'

import { faRefresh } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useMemo, useState } from 'react'
import {
	useStateWithErrorMessageField,
	useStateWithInputChange,
	useStateWithSelectChange,
} from 'react-utils/dist/hooks'
import { createCalEvents, CreateCalEventsProps, ReserveTime } from './api'
import { Menu, PageLink, ReserveMatrix } from './components'
import { MessageField } from './components/MessageField'
import { DateType } from './components/types'
import { useReserveMatrix, useStateWithReserveChecks } from './hooks'
import { ReserveCheckChangeState } from './hooks/types'
import './style.css'
const RESERVE_MATRIX_DATE_LIMIT = 30

export function Reserve() {
	const [axisDate, setAxisDate] = useState(new Date())
	const [currCalendars, isLoading, error] = useReserveMatrix(axisDate)

	const [isPostLoading, setPostLoading] = useState(false)
	const [email, setEmail, setEmailValue] = useStateWithInputChange()
	const [name, setName, setNameValue] = useStateWithInputChange()

	const [menuState, setMenu, setMenuValue] = useStateWithSelectChange()
	const [reserveSelects, setReserveSelects, setReserveSelectsValue] =
		useStateWithReserveChecks()

	const [msg, isError, setMsgField] = useStateWithErrorMessageField('')
	const [currPageNum, setCurrPageNum] = useState(0)

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
			setMsgField('予約できませんでした。選択されたメニューがありません。')
			setPostLoading(false)
			return
		}

		const requireCells = menuItem.miniutes / timeUnitOfCell
		const menuName = menuState.text

		console.log('reserveSelects', { reserveSelects })
		const dataChecks = Object.values(reserveSelects).filter(
			// rome-ignore lint/complexity/useSimplifiedLogicExpression: <explanation>
			(e): e is ReserveCheckChangeState => e?.checked || false,
		)
		// 予約時間チェック(同日か)
		const dateAxisIndexes = new Set(dataChecks.map((e) => e.dateAxisIndex))
		if (dateAxisIndexes.size > 1) {
			setMsgField('予約できませんでした。予約は同じ日でなければなりません。')
			setPostLoading(false)
			return
		}

		// 予約時間チェック(指定時間であるか)
		if (dataChecks.length !== requireCells) {
			setMsgField(
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
		console.log('check', { timeAxisIndexes })
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
			setMsgField(
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
			setMsgField('予約できませんでした。メールアドレスを入力してください。')
			setPostLoading(false)
			return
		}

		if (body.name === '') {
			setMsgField('予約できませんでした。お名前を入力してください。')
			setPostLoading(false)
			return
		}

		setMsgField('', false)

		try {
			const result = await createCalEvents(axisDate, body)
			if (!result) {
				console.warn('予約失敗')
				throw new Error()
			}
			setEmailValue('')
			setNameValue('')
			setMsgField(
				'ご入力のメールアドレスに予約招待メールを送信しました。キャンセルをする場合はメール内の"参加しますか? はい - 未定 - いいえ"の"いいえ"を選択して下さい。',
				false,
			)
		} catch (e) {
			setMsgField(
				'予約が失敗しました。既に予約されている場合は、予約招待メールからキャンセルをしてから再度、予約してください。既に予約されていない場合は、他のユーザーが指定した時間を予約しました。',
			)
			console.warn({ e })
		} finally {
			setAxisDate(new Date())
			setPostLoading(false)
		}
	}

	const [
		pageNum,
		slicedDateAxis,
		canReserveData,
		startDateOffsetIndex,
		endDateOffsetIndexExclusive,
	] = useMemo(() => {
		if (!currCalendars) return [0, []]
		const { reserveMatrix } = currCalendars
		const pageNum = Math.floor(
			reserveMatrix.dateAxis.length / RESERVE_MATRIX_DATE_LIMIT,
		)
		const slicedDateAxis = reserveMatrix.dateAxis.slice(
			RESERVE_MATRIX_DATE_LIMIT * currPageNum,
			RESERVE_MATRIX_DATE_LIMIT * (currPageNum + 1),
		)
		console.log('useMemo reserveMatrix', { currPageNum })

		const startDateOffsetIndex = currPageNum * RESERVE_MATRIX_DATE_LIMIT
		const endDateOffsetIndexExclusive =
			(currPageNum + 1) * RESERVE_MATRIX_DATE_LIMIT

		const canReserveData = Object.entries(currCalendars.reserveMatrix.data)
			.filter(
				([, times]) =>
					times.dateAxisIndex >= startDateOffsetIndex &&
					times.dateAxisIndex < endDateOffsetIndexExclusive,
			)
			.reduce((pre, [date, times]) => {
				pre[date] = times
				return pre
			}, {} as DateType)
		return [
			pageNum,
			slicedDateAxis,
			canReserveData,
			startDateOffsetIndex,
			endDateOffsetIndexExclusive,
		]
	}, [currCalendars, currPageNum])

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
				<MessageField msg={msg} isError={isError} />
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
							<PageLink
								currCalendars={currCalendars}
								pageNum={pageNum}
								currPageNum={currPageNum}
								setCurrPageNum={setCurrPageNum}
							/>

							<ReserveMatrix
								key={`ReserveMatrix_${currPageNum}`}
								currCalendars={currCalendars}
								pageLinkNum={currPageNum}
								selects={reserveSelects}
								onChange={setReserveSelects}
								startDateOffsetIndex={startDateOffsetIndex}
								endDateOffsetIndexExclusive={endDateOffsetIndexExclusive}
								slicedDateAxis={slicedDateAxis}
								canReserveData={canReserveData}
							/>
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
								onClick={() => setReserveSelectsValue({})}
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
