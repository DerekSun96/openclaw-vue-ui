import { ElNotification } from 'element-plus'

type NotifyType = 'success' | 'error'

export function notifyMessage(message: string, type: NotifyType = 'error', title?: string) {
  return ElNotification({
    title: title ?? (type === 'success' ? '成功' : '错误'),
    message,
    type,
    position: 'bottom-right',
  })
}
