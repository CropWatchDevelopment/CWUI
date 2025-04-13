import moment from "moment";

export function isActive(upload_interval: number, last_updated: Date | null | undefined): boolean | null {
    if (upload_interval === -1) return null;
    if (last_updated === null || last_updated === undefined) return false;
    return moment().diff(moment(last_updated), 'minutes') < upload_interval;
};