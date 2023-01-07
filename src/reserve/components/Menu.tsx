import { ReserveMatrixData } from '../types'
import { forwardRef } from 'react'

export interface MenutProps {
	currCalendars: ReserveMatrixData | null
	disabled?: boolean
	onChange?: React.ChangeEventHandler<HTMLSelectElement>
}

export function Menu({
	currCalendars,
	disabled = false,
	onChange = () => null,
}: MenutProps) {
	let menuItems: ReserveMatrixData['menuItems'] = []
	if (currCalendars) {
		menuItems = [...currCalendars.menuItems]
		if (onChange) {
			const e = menuItems[0]
			onChange({
				target: {
					value: e.id,
					selectedOptions: [
						{
							text: `${e.name}(${e.miniutes}分)`,
						},
					],
				},
			} as unknown as React.ChangeEvent<HTMLSelectElement>)
		}
	}

	// --- メニュー追加
	return (
		<select id="menu" disabled={disabled} onChange={onChange}>
			{menuItems.map((e, i) => (
				<option key={`MenuOptions_${i}`} value={e.id}>
					{e.name}({e.miniutes}分)
				</option>
			))}
		</select>
	)
}
