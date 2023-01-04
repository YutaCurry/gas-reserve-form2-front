import React, { useCallback, useEffect, useState } from 'react'
import { ReserveMatrixData } from '../types'

export interface PageLinkProps {
	currCalendars: ReserveMatrixData | null
	children: React.ReactNode
}

const RESERVE_MATRIX_DATE_LIMIT = 30

export function PageLink({ currCalendars, children }: PageLinkProps) {
	const [viewChildren, setViewChildren] = useState<React.ReactNode[]>([])
	const [currPageNum, setCurrPageNum] = useState(0)

	const togglePageLinkNum = useCallback(
		(pageLinkNum: number) => {
			// 一旦すべて非表示
			const backChildren = React.Children.toArray(children)
			setViewChildren([backChildren[pageLinkNum]])
		},
		[children],
	)
	useEffect(() => {
		togglePageLinkNum(currPageNum)
	}, [currCalendars, children, togglePageLinkNum, currPageNum])

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

	const pageNum = Math.floor(
		currCalendars.reserveMatrix.dateAxis.length / RESERVE_MATRIX_DATE_LIMIT,
	)

	return (
		<>
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
			{viewChildren}
		</>
	)
}
