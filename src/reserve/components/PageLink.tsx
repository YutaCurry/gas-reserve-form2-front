import { ReserveMatrixData } from '../types'

export interface PageLinkProps {
	currCalendars: ReserveMatrixData
}

const RESERVE_MATRIX_DATE_LIMIT = 30

export function PageLink({ currCalendars: { reserveMatrix } }: PageLinkProps) {
	// TODO
	function togglePageLinkNum(pageLinkNum: number) {
		// // 一旦すべて非表示
		// const pageLinkData = document.getElementsByClassName('pageLinkData')
		// Array.from(pageLinkData).forEach((e) => (e.style.display = 'none'))
		// Array.from(pageLinkData).forEach((e2) => {
		// 	if (e2.dataset.pageLinkNum == pageLinkNum) {
		// 		e2.style.display = 'grid'
		// 	}
		// })
		// const pageLink = document.getElementsByClassName('pageLink')
		// Array.from(pageLink).forEach((e) => e.classList.remove('foucus'))
		// Array.from(pageLink)
		// 	.find((e) => e.dataset.pageLinkNum == pageLinkNum)
		// 	.classList.add('foucus')
	}

	function onPageLinkClickListener(
		e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
	) {
		e.preventDefault()

		const pageLinkNum = e.currentTarget.dataset.pageLinkNum
		togglePageLinkNum(Number(pageLinkNum!))
	}

	togglePageLinkNum(0)

	const pageNum = Math.floor(
		reserveMatrix.dateAxis.length / RESERVE_MATRIX_DATE_LIMIT,
	)

	return (
		<section id="pageLinkSection">
			{[...Array(pageNum).keys()].map((e, i) => {
				const dateTimeStr =
					reserveMatrix.dateAxis[(i + 1) * RESERVE_MATRIX_DATE_LIMIT - 1]
				const dateDetail = reserveMatrix.dateDetail[dateTimeStr]
				const tailDate = `...${dateDetail.dateStr}(${dateDetail.dayOfWeek})`
				const pageLink = (
					// rome-ignore lint/a11y/useValidAnchor: <explanation>
					<a
						href={' '}
						className="pageLink"
						data-pageLinkNum={String(i)}
						onClick={onPageLinkClickListener}
					>
						{tailDate}
					</a>
				)
				return pageLink
			})}
		</section>
	)
}
