import { ReserveMatrixData } from '../types'
import { forwardRef } from 'react'

export interface MenutProps {
	currCalendars: ReserveMatrixData | null
}

export const Menu = forwardRef<HTMLSelectElement, MenutProps>(
	({ currCalendars }, ref) => {
		let menuItems: ReserveMatrixData['menuItems'] = []
		if (currCalendars) {
			menuItems = [...currCalendars.menuItems]
		}
		// --- メニュー追加
		return (
			<select id="menu" ref={ref}>
				{menuItems.map((e) => (
					<option value={e.id}>
						{e.name}({e.miniutes}分)
					</option>
				))}
			</select>
		)
	},
)
