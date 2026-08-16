notification_queue = []


def add_notification(notification):
    notification_queue.append(notification)
    return {
        "message": "Notification added to queue",
        "queue_size": len(notification_queue)
    }


def get_notifications():
    return notification_queue


def process_notification():
    if len(notification_queue) == 0:
        return {"message": "Queue is empty"}

    notification = notification_queue.pop(0)

    return {
        "message": "Notification processed",
        "notification": notification
    }