library('jsonlite')
options(stringsAsFactors=FALSE)
main <- function (jsonObj) {
 o = fromJSON(jsonObj)
 o$a
 
}