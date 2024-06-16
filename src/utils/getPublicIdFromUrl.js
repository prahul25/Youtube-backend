const publicId = (filePath) =>{
    const splitedUrl = filePath.split("/")
    const urlArray = splitedUrl[splitedUrl.length-1]
    const publicId = urlArray.split(".")[0]
    return publicId
}

export {publicId}