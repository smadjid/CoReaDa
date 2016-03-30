options(stringsAsFactors=FALSE)
selectedCourse='nodejs'
setwd(paste('/home/madjid/dev/CoReaDa/R/',selectedCourse, sep='/'))

load('nodejs.rdata')
load('nodejs.structure.rdata')


paths = nodejs[,c('user_id','seance','part_id','date','duration')]
paths=paths[order(paths$date),]
paths$id = 1:nrow(paths)
paths$reading_index = 1
users = unique(paths$user_id)
nusers = length(users)

for(i in 1:nusers)
{
  print(paste('user: ',i,' from ',nusers))
  userData=paths[which(paths$user_id==users[i]),]
  nuserData = nrow(userData)
  userData=userData[order(userData$date),]
  userData$reading_index = 1:nuserData
  for(j in 1:nrow(userData)){
    paths[which(paths$id== userData$id[j]),c('reading_index','user_id')] = c(serData$reading_index[j],paste('User',i, sep='_'))
  }
  
}