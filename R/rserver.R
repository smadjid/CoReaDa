library('jsonlite')
options(stringsAsFactors=FALSE)
library(Rserve)

Rserve(args='--vanilla')




require("RSclient")
c <- RSconnect()
RSshutdown(c)