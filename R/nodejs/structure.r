#http://codebeautify.org/jsonviewer

library('jsonlite')
options(stringsAsFactors=FALSE)
courses=c('nodejs','entreprendre','xml','java')



for(course_nb in 1:(length(courses))) 
{
print(courses[course_nb])
setwd(paste('/home/madjid/dev/R/data',selectedCourse, sep='/'))

jsonstructure <- fromJSON("jsonstructure.json")

id_counter = 0;
course.structure = data.frame(id=id_counter, part_id=jsonstructure$id, paranetId=0,title=jsonstructure$title, type=jsonstructure$subtype,slug=jsonstructure$slug)

ntomes = nrow(jsonstructure$children)
if(ntomes>0)
for(t_counter in 1:ntomes){
 
  itome = as.data.frame(jsonstructure$children[t_counter,])
  tome.structure = data.frame(id=NULL, part_id=itome$id, paranetId=course.structure[1,'part_id'],title=itome$title, type=itome$subtype,slug=itome$slug)
  course.structure = rbind(course.structure , tome.structure)
  
  chaps= as.data.frame(itome$children)
    nchaps =  nrow(chaps)
  if(nchaps>0)
  for(ch_counter in 1:nchaps){
    id_counter = id_counter + 1
    ichap =  as.data.frame(chaps[ch_counter,])
    chap.structure = data.frame(id=id_counter, part_id=ichap$id, paranetId=itome$id,title=ichap$title, type=ichap$subtype,slug=ichap$slug)
    course.structure = rbind(course.structure , chap.structure)
    
    parts =  as.data.frame(ichap$children)
    npart = nrow(parts)
    
    if(npart>0)
    for(part_counter in 1:npart ){
      id_counter = id_counter + 1
      ipart =  as.data.frame(ichap$children)[part_counter,]
      part.structure = data.frame(id = id_counter, part_id=ipart$id, paranetId=ichap$id,title=ipart$title, type=ipart$subtype,slug=ipart$slug)
      course.structure = rbind(course.structure , part.structure)
    }
  }
  
}

save(course.structure, file='course.structure.rdata')

}

print('OK!')