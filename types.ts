import {OptionalId} from "mongodb";

export type ContactModel = OptionalId<{
  name: string,
  phone: string,
  country: string,
  timezone: string,
}>;

// https://api-ninjas.com/api/validatephone
export type API_Phone = {
    is_valid: string,
    country: string,
    timezones: string[]
}
// https://api-ninjas.com/api/worldtime
export type API_Time = {
    datetime: string
}