let notify = null;

export function setNotification(fn) {
    notify = fn;
}

export function notification(msg) {
    if (notify) notify(msg);
}
