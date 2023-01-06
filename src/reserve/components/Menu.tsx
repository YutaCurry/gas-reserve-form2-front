import { ReserveMatrixData } from '../types'
import { forwardRef } from 'react'

export interface MenutProps {
	currCalendars: ReserveMatrixData | null
	disabled?: boolean
}

export const Menu = forwardRef<HTMLSelectElement, MenutProps>(
	({ currCalendars, disabled = false }, ref) => {
		let menuItems: ReserveMatrixData['menuItems'] = []
		if (currCalendars) {
			menuItems = [...currCalendars.menuItems]
		}
		// --- メニュー追加
		return (
			<select id="menu" ref={ref} disabled={disabled}>
				{menuItems.map((e, i) => (
					<option key={`MenuOptions_${i}`} value={e.id}>
						{e.name}({e.miniutes}分)
					</option>
				))}
			</select>
		)
	},
)
