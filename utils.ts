import { GraphQLError } from "graphql"
import { API_Phone, API_Time } from "./types.ts";

export const validatephone = async(phone:string) => {
    const API_KEY = Deno.env.get("API_KEY")
    if(!API_KEY) throw new GraphQLError("API_KEY not found");
    const url = `https://api-ninjas.com/api/validatephone?number=${phone}`
    const data = await fetch(url,{
        headers: {
            'X-Api-Key': 'API_KEY'
          },
    })
    if(data.status!== 200) throw new GraphQLError("Error in the API")
    const result:API_Phone = await data.json()
    if(!result.is_valid) throw new GraphQLError("Phone does not exist")
    return {
        country: result.country,
        timezone: result.timezones[0]
    }    
}

export const getDateTime = async (timezone: string) => {
    const API_KEY= Deno.env.get("API_KEY");
    if(!API_KEY) throw new GraphQLError("API_KEY not found")
    const url = `https://api-ninjas.com/api/worldtime?timezone=${timezone}`
    const data = await fetch(url,{
        headers: {
            'X-Api-Key': 'API_KEY'
          },
    })
    if(data.status!== 200) throw new GraphQLError("Error in the API")
    const result:API_Time = await data.json()
    return result.datetime
}