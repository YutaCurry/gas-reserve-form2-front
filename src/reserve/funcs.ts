/**
 * エラーメッセージ表示。
 *
 */
export function showMessage(msg: string, isError = true) {
	const msgLabel = document.getElementById('msgLabel')
	msgLabel!.innerHTML = msg
	msgLabel!.className = isError ? 'err' : 'info'
}

/**
 * カレンダーイベント作成後の処理。
 * @param ret(bool) createCalendarEventの返却値。
 */
export function onCreateCalendarEvent(ret: boolean) {
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

	// try {
	// 	const res = await axios.get(
	// 		`${process.env
	// 			.REACT_APP_GET_RESERVE_MATRIX_URL!}?axisDateTime=${axisDate.getTime()}`,
	// 	)
	// 	return isReserveMatrix(res.data) ? res.data : null
	// } catch (e) {
	// 	return null
	// }

	// google.script.run
	// .withSuccessHandler(onReserveMatrix)
	// .getReserveMatrixOuter(axisDate.getTime())
	// window.scroll({
	//   top: 0,
	//   behavior: "smooth"
	// });
}
