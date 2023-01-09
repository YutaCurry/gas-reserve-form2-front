import { ReserveMatrixData } from './types'

export interface MenutProps {
	currCalendars: ReserveMatrixData | null
	selectedId: ReserveMatrixData['menuItems'][number]['id']
	disabled?: boolean
	onChange?: React.ChangeEventHandler<HTMLSelectElement>
}

export function Menu({
	currCalendars,
	selectedId,
	disabled = false,
	onChange = () => null,
}: MenutProps) {
	let menuItems: ReserveMatrixData['menuItems'] = []
	if (currCalendars) {
		menuItems = [...currCalendars.menuItems]
	}

	// --- メニュー追加
	return (
		<select id="menu" disabled={disabled} onChange={onChange}>
			{menuItems.map((e, i) => (
				<option
					key={`MenuOptions_${i}`}
					value={e.id}
					selected={selectedId === e.id}
				>
					{e.name}({e.miniutes}分)
				</option>
			))}
		</select>
	)
}
