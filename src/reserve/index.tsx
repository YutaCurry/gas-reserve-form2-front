// import style from './style.css'

export function Reserve() {
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
				<select id="menu" />
				<section id="pageLinkSection" />
			</section>
			<section className="reserveContainer">
				<article id="reserveMatrix" />
				<section id="btnSection">
					<button id="send">予約</button>
					<button id="selectClear">選択クリア</button>
				</section>
				<section className="loaderContainer">
					<div className="loader">Loading...</div>
					<span>お待ちください。</span>
				</section>
			</section>
			<section className="maintenance">
				<span>メンテナンス中です。</span>
			</section>
		</main>
	)
}
