function main() {
	const dataClassName = 'reserveData'
	let currCalendars = {}
	const axisDate = new Date()
	const RESERVE_MATRIX_DATE_LIMIT = 30

	/**
	 * エラーメッセージ表示。
	 *
	 */
	function showMessage(msg: string, isError = true) {
		const msgLabel = document.getElementById('msgLabel')
		msgLabel!.innerHTML = msg
		msgLabel!.className = isError ? 'err' : 'info'
	}

	/**
	 * カレンダーイベント作成後の処理。
	 * @param ret(bool) createCalendarEventの返却値。
	 */
	function onCreateCalendarEvent(ret: boolean) {
		if (ret) {
			document.getElementById('email')!.nodeValue = ''
			document.getElementById('name')!.nodeValue = ''
			showMessage(
				'ご入力のメールアドレスに予約招待メールを送信しました。<br />キャンセルをする場合はメール内の"参加しますか? はい - 未定 - いいえ"の"いいえ"を選択して下さい。',
				false,
			)
		} else {
			showMessage(
				'予約が失敗しました。既に予約されている場合は、予約招待メールからキャンセルをしてから再度、予約してください。既に予約されていない場合は、他のユーザーが指定した時間を予約しました。',
			)
		}

		google.script.run
			.withSuccessHandler(onReserveMatrix)
			.getReserveMatrixOuter(axisDate.getTime())

		// window.scroll({
		//   top: 0,
		//   behavior: "smooth"
		// });
	}

	/**
	 * 予約ボタンクリックイベント処理。
	 */
	const onSendClickListener = (e) => {
		document.getElementsByClassName('loaderContainer')[0].hidden = false

		// --- 予約時間チェック(HOUR)
		// セルの時間単位
		const timeUnitOfCell = currCalendars.periodMiniutes
		const menuNode = document.getElementById('menu')

		// メニュー取得
		const menuItem = currCalendars.menuItems.find(
			(e) => e.id === menuNode.value,
		)
		if (!menuItem) {
			showMessage(`予約できませんでした。選択されたメニューがありません。`)
			document.getElementsByClassName('loaderContainer')[0].hidden = true
			return
		}

		const requireCells = menuItem.miniutes / timeUnitOfCell
		const menuName = menuNode.selectedOptions[0].text

		// 予約時間
		const dataTags = Array.from(
			document.getElementsByClassName(dataClassName + 'Check'),
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
			showMessage(`予約できませんでした。予約は同じ日でなければなりません。`)
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
		const [seqValid, _] = timeAxisIndexes.reduce(
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
				`予約できませんでした。予約は連続した時間でなければなりません。`,
			)
			document.getElementsByClassName('loaderContainer')[0].hidden = true
			return
		}

		// 予約時間変換
		const reserveTimes = [
			{
				startTime: currCalendars.reserveMatrix.timeAxis[timeAxisIndexes[0]][0],
				endTime:
					currCalendars.reserveMatrix.timeAxis[timeAxisIndexes.slice(-1)[0]][1],
				date: currCalendars.reserveMatrix.dateAxis[dataChecks[0].dateAxisIndex],
			},
		]

		const body = {
			email: document.getElementById('email').value,
			name: document.getElementById('name').value,
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
		google.script.run
			.withSuccessHandler(onCreateCalendarEvent)
			.createCalendarEventOuter(axisDate.getTime(), JSON.stringify(body))
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
		currCalendars,
		pageLinkNum,
		startDateOffsetIndex,
		endDateOffsetIndexExclusive,
	) {
		const { reserveMatrix, periodMiniutes, menuItems } = currCalendars

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
          grid-column: ${time.timeAxisIndex + 1} / ${time.timeAxisIndex + 2};
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
				const exist = Object.entries(reserveMatrix.data).find(
					([date, times]) => {
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
					},
				)
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
	function onReserveMatrix(calendars) {
		currCalendars = calendars

		if (currCalendars.maintenceFlag) {
			document.getElementById('require').style.display = 'none'
			document.getElementsByClassName('reserveContainer')[0].style.display =
				'none'
			document.getElementsByClassName('maintenance')[0].style.display = 'block'
			return
		}
		document.getElementsByClassName('maintenance')[0].style.display = 'none'

		const { reserveMatrix, periodMiniutes, menuItems } = currCalendars

		// --- メニュー追加
		const menuItemTags = menuItems.map((e) => {
			const menuOptionTag = document.createElement('option')
			menuOptionTag.value = e.id
			menuOptionTag.text = `${e.name}(${e.miniutes}分)`
			return menuOptionTag
		})
		const menuTag = document.getElementById('menu')
		while (menuTag.firstChild) {
			menuTag.removeChild(menuTag.firstChild)
		}
		menuTag.append(...menuItemTags)

		// --- 予約可能リストのレンダリング
		const pageNum = Math.floor(
			reserveMatrix.dateAxis.length / RESERVE_MATRIX_DATE_LIMIT,
		)
		const reserveMatrixList = [...Array(pageNum).keys()].map((e, i) => {
			return createReserveMatrix(
				currCalendars,
				i,
				i * RESERVE_MATRIX_DATE_LIMIT,
				(i + 1) * RESERVE_MATRIX_DATE_LIMIT,
			)
		})

		const reserveMatrixNode = document.getElementById('reserveMatrix')
		while (reserveMatrixNode.firstChild) {
			reserveMatrixNode.removeChild(reserveMatrixNode.firstChild)
		}
		reserveMatrixList.forEach((e) => reserveMatrixNode.appendChild(e))

		function togglePageLinkNum(pageLinkNum) {
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
			pageLink.dataset.pageLinkNum = i

			const dateTimeStr =
				reserveMatrix.dateAxis[(i + 1) * RESERVE_MATRIX_DATE_LIMIT - 1]
			const dateDetail = reserveMatrix.dateDetail[dateTimeStr]
			const tailDate = `...${dateDetail.dateStr}(${dateDetail.dayOfWeek})`
			pageLink.text = tailDate
			pageLink.addEventListener('click', onPageLinkClickListener)
			return pageLink
		})
		const pageLinkSection = document.getElementById('pageLinkSection')
		while (pageLinkSection.children.length > 0) {
			pageLinkSection.removeChild(pageLinkSection.firstChild)
		}

		pageLinkSection.append(...pageLinks)

		togglePageLinkNum(0)

		document.getElementsByClassName('loaderContainer')[0].hidden = true

		document
			.getElementById('send')
			.removeEventListener('click', onSendClickListener)
		document
			.getElementById('send')
			.addEventListener('click', onSendClickListener)
		document
			.getElementById('selectClear')
			.removeEventListener('click', onSelectClearClickListener)
		document
			.getElementById('selectClear')
			.addEventListener('click', onSelectClearClickListener)
	}

	google.script.run
		.withSuccessHandler(onReserveMatrix)
		.getReserveMatrixOuter(axisDate.getTime())
}
