import { Collection, ObjectId } from "mongodb";
import { ContactModel } from "./types.ts";
import { getDateTime, validatephone } from "./utils.ts";
import { GraphQLError } from "graphql";


type Context = {
    ContactCollection: Collection<ContactModel>
}

type MutationArgs = {
    id: string, 
    name: string, 
    phone: string
    country: string,
    timezone: string
}

export const resolvers = {
    Contact: {
        id: (parent: ContactModel) => parent._id!.toString(), //COnvierte en una cadena de texto
        time: async(parent:ContactModel) => await getDateTime(parent.timezone) //calcula la hora 
    },

    Query: {
        getContact: async ( //Encontrar a una persona
            _:unknown,
            args: MutationArgs,
            context:Context
        ): Promise<ContactModel> => {
            const result = await context.ContactCollection.findOne({_id: new ObjectId(args.id)})
            if(!result) throw new GraphQLError("Contact not found")
            return result;
        },
        getContacts: async( //Mostrar a todas las personas
            _:unknown,
            __:unknown,
            context:Context,
        ): Promise<ContactModel[]> => {
            return await context.ContactCollection.find().toArray();
        }
    },
    Mutation: {
        addContact: async(
            _:unknown,
            args: MutationArgs,
            context: Context,
        ): Promise<ContactModel> => {
            const {name, phone} = args
            const {country, timezone} = await validatephone(phone)
            const phone_exist = await context.ContactCollection.findOne({phone})
            if(phone_exist) throw new GraphQLError("El contacto ya existe")

            const {insertedId} = await context.ContactCollection.insertOne({
                name,
                phone,
                country,
                timezone,
            })

            return {
                _id: insertedId,
                name,
                phone,
                country,
                timezone,
            }
        },
        deleteContact: async (
            _: unknown,
            args: MutationArgs,
            context: Context,
        ): Promise<boolean> => {
            const {deletedCount} = await context.ContactCollection.deleteOne({_id: new ObjectId(args.id)})
            if(deletedCount === 0) return false;
            return true;
        },

        updateContact: async (
            _:unknown,
            args: MutationArgs,
            context: Context,
        ): Promise<ContactModel> => {
            const {id, phone} = args
            if(phone){
                const {country, timezone} = await validatephone(phone)
                args = {...args, country, timezone} //Copia los valores antiguos
            }
            const phone_exist = await context.ContactCollection.findOne({phone})
            if(phone_exist) throw new GraphQLError("Contact not found")
            const result = await context.ContactCollection.findOneAndUpdate(
                {_id: new ObjectId(id)},
                {$set: {...args}},
                //{returnDocument: "after"}
            )
            if(!result) throw new GraphQLError("Contact not found")
            return result
        }
    }
}