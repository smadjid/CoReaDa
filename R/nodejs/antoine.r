options(stringsAsFactors=FALSE)

courses=c('nodejs','entreprendre','xml','java')
CoursesData=data.frame(course_id=integer(),user_id=integer(),part_id=integer(),session_id=character(),
                       sequence_number=integer(),duration=integer(), stringsAsFactors=FALSE)
CoursesStructures=data.frame(course_id=integer(),part_id=integer(),position=integer(),
                             median_time=integer(), title=character(), stringsAsFactors=FALSE)

for(course_nb in 1:(length(courses))) 
{
  print(courses[course_nb])
  selectedCourse = courses[course_nb]
  
  setwd(paste('/home/madjid/dev/R',selectedCourse, sep='/'))
  Data <- get( load(paste(selectedCourse,"rdata",sep=".")))
  Structure <- get( load(paste(selectedCourse,"structure","rdata",sep=".")))
  
  
#  course_id: int; user_id: var_char; sequence_number: int ; part_id: int ; duration: int; session_id: int
Data = Data[,c('course_id','user_id','part_id','session_id','date','duration')]
course_id=unique(Data$course_id)

# part_id: int; position: int; title: var_char; type: int; median_time: int
Structure = Structure[,c('id','part_id','title','type','median.duration')]
Structure$course_id = course_id

colnames(Structure)=c('position','part_id','title','type','median_time','course_id')
Structure = Structure[,c('course_id','part_id','type','position','title','median_time')]
 

Data=Data[order(Data$date),]
Data$id = 1:nrow(Data)
Data$sequence_number = 1
users = unique(Data$user_id)
nusers = length(users)

for(i in 1:nusers)
{
  print(paste('Course: ',selectedCourse, '- user: ',i,' from ',nusers))
  userData=Data[which(Data$user_id==users[i]),]
  nuserData = nrow(userData)
  userData=userData[order(userData$date),]
  userData$sequence_number = 1:nuserData
  for(j in 1:nrow(userData)){
    Data[which(Data$id== userData$id[j]),c('sequence_number')] = c(userData$sequence_number[j])
  }
  
}
#course_id: int; user_id: var_char; sequence_number: int ; part_id: int ; duration: int; session_id: int
Data = Data[,c('course_id','user_id','part_id','session_id','sequence_number','duration')] 
sortnames <- c("user_id", "sequence_number")
Data = Data[do.call("order", Data[sortnames]), ]

CoursesData =  rbind(CoursesData, Data)
CoursesStructures =    rbind(CoursesStructures, Structure)


}

print('OK')

setwd('/home/madjid/dev/R')
CoursesStructures[CoursesStructures$type=='title-1',]$type='Part'
CoursesStructures[CoursesStructures$type=='title-2',]$type='Chapter'
CoursesStructures[CoursesStructures$type=='title-3',]$type='Section'
CoursesStructures[CoursesStructures$position<0,]$position=0
save(CoursesData,file='CoursesData.rdata')
save(CoursesStructures,file='CoursesStructures.rdata')

write.csv(CoursesData,file='CoursesData.csv')
write.csv(CoursesStructures,file='CoursesStructures.csv')
