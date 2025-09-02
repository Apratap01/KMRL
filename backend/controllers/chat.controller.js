export const realtimeChat = async(req,res)=>{
    const docId = req.params.docId
    const chunkId = req.params.chunkId
    if(!chunkId){
        return res.status(400).send("No chunk id given")
    }
    if(!docId){
        return res.status(400).json({"message":"No doc id given"})
    }
    
}