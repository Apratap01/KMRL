import { getResponseFromFastApi } from "../services/chatService.js"

export const realtimeChat = async(req,res)=>{
    try {
        const docId = req.params.docId
        const chunkId = req.params.chunkId
        const {query} = req.body
        if(!query){
            return res.status(400).send("No query found")
        }
        if(!chunkId){
            return res.status(400).send("No chunk id given")
        }
        if(!docId){
            return res.status(400).json({"message":"No doc id given"})
        }
        const queryResult = await getResponseFromFastApi(chunkId,query)
        console.log(queryResult)
        return res.status(200).json({"message":"Sent successfully","queryResult":queryResult.answer})
    } 
    catch (error) {
        console.log(error.message)
        return res.status(500).send('Error fetching response from backend')
    }
}