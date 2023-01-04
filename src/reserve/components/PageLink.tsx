import { ReserveMatrixData } from '../types'

export interface PageLinkProps {
	currCalendars: ReserveMatrixData | null
}

const RESERVE_MATRIX_DATE_LIMIT = 30

export function PageLink({ currCalendars }: PageLinkProps) {
	if (!currCalendars) {
		return <></>
	}

	const { reserveMatrix } = currCalendars
	function togglePageLinkNum(pageLinkNum: number) {
		// 一旦すべて非表示
		const pageLinkData = document.getElementsByClassName('pageLinkData')
		const pageLintHtmlDoms = Array.from(pageLinkData).filter(
			(e): e is HTMLElement => e instanceof HTMLElement,
		)
		pageLintHtmlDoms.forEach((e) => (e.style.display = 'none'))
		pageLintHtmlDoms.forEach((e2) => {
			if (e2.dataset['pagelinknum'] === String(pageLinkNum)) {
				e2.style.display = 'grid'
			}
		})
		const pageLink = document.getElementsByClassName('pageLink')
		const pageLinkHtmlDoms = Array.from(pageLink).filter(
			(e): e is HTMLElement => e instanceof HTMLElement,
		)
		pageLinkHtmlDoms.forEach((e) => e.classList.remove('foucus'))
		pageLinkHtmlDoms
			.find((e) => e.dataset['pagelinknum'] === String(pageLinkNum))
			?.classList.add('foucus')
	}

	function onPageLinkClickListener(
		e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
	) {
		e.preventDefault()

		const pageLinkNum = e.currentTarget.dataset['pagelinknum']
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
						key={`PageLink_${i}`}
						href={' '}
						className="pageLink"
						data-pagelinknum={String(i)}
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
