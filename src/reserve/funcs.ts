export function extractEmptyIndex(key: string) {
	const keyRegex = /empty-(?<dateAxisIndex>\d+?)-(?<timeAxisIndex>\d+?)/gu
	const match = keyRegex.exec(key)
	if (!match) {
		return [-1, -1]
	}
	const [, dateAxisIndex, timeAxisIndex] = match
	return [Number(dateAxisIndex), Number(timeAxisIndex)]
}

export function createEmptyIndexKey(
	dateAxisIndex: number,
	timeAxisIndex?: number,
) {
	return `empty-${dateAxisIndex}-${timeAxisIndex}`
}
