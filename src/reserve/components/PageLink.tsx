import React from 'react'
import { ReserveMatrixData } from './types'

export interface PageLinkProps {
	currCalendars: ReserveMatrixData | null
	pageNum: number
	currPageNum: number
	setCurrPageNum: React.Dispatch<React.SetStateAction<number>>
}

const RESERVE_MATRIX_DATE_LIMIT = 30

export function PageLink({
	currCalendars,
	pageNum,
	currPageNum,
	setCurrPageNum,
}: PageLinkProps) {
	if (!currCalendars) {
		return <></>
	}

	function onPageLinkClickListener(
		e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
	) {
		e.preventDefault()

		const pageLinkNum = e.currentTarget.dataset['pagelinknum']
		setCurrPageNum(Number(pageLinkNum || 0))
	}

	return (
		<section
			id="pageLinkSection"
			style={{ display: 'flex', justifyContent: 'center' }}
		>
			{[...Array(pageNum).keys()].map((e, i) => {
				const dateTimeStr =
					currCalendars.reserveMatrix.dateAxis[
						(i + 1) * RESERVE_MATRIX_DATE_LIMIT - 1
					]
				const dateDetail = currCalendars.reserveMatrix.dateDetail[dateTimeStr]
				const tailDate = `...${dateDetail.dateStr}(${dateDetail.dayOfWeek})`
				const pageLink = (
					// eslint-disable-next-line jsx-a11y/anchor-is-valid
					<a
						key={`PageLink_${i}`}
						className={`pageLink ${i === currPageNum && 'foucus'}`}
						data-pagelinknum={String(i)}
						// rome-ignore lint/a11y/useValidAnchor: <explanation>
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
