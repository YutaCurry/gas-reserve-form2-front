export interface MessageFieldProps {
	msg: string
	isError?: boolean
}

export function MessageField({ msg, isError = true }: MessageFieldProps) {
	return (
		<span id="msgLabel" className={isError ? 'err' : 'info'}>
			{msg}
		</span>
	)
}
