// import { connectToDatabase } from "./database"


// export const connectToAlbion = {
//     connect: async () => {
//         try {
//             const itemRepo = connectToDatabase.getItemRepo()
//             if (!itemRepo) {
//                 throw new Error("Database not connected. Call connectToDatabase.connect() first.")
//             }
//             const metadata = await itemRepo.fetchMetadata()
//             return metadata
//         } catch (error) {
//             console.error('Error fetching Albion metadata:', error)
//             throw error
//         }
//     }
// }