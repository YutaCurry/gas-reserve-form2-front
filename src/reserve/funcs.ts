export function extractEmptyIndex(key: string) {
	console.log(key)

	const keyRegex = /empty-(?<dateAxisIndex>\d+?)-(?<timeAxisIndex>\d+?)/gu
	const match = keyRegex.exec(key)
	if (!match) {
		return [-1, -1]
	}
	const [, dateAxisIndex, timeAxisIndex] = match
	console.log(dateAxisIndex, timeAxisIndex)
	return [Number(dateAxisIndex), Number(timeAxisIndex)]
}

export function createEmptyIndexKey(
	dateAxisIndex: number,
	timeAxisIndex?: number,
) {
	return `empty-${dateAxisIndex}-${timeAxisIndex}`
}
