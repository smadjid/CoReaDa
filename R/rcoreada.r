library('jsonlite')
options(stringsAsFactors=FALSE)

main <- function (jsonObj) {
 o = fromJSON(jsonObj)
 o$a
 
}
###############  INIT ###########################
init <- function(){
	slugs=c("apprenez-a-programmer-en-python","apprenez-le-fonctionnement-des-reseaux-tcp-ip","comment-financer-son-projet-solidaire","debutez-l-analyse-logicielle-avec-uml",
"decouvrez-le-monde-des-start-ups","developpez-votre-site-web-avec-le-framework-symfony2","financer-son-entreprise","gerer-son-code-avec-git-et-github",
"programmez-avec-le-langage-c","simplifiez-vos-reunions-grace-au-doodling","trouvez-un-job-qui-vous-correspond-1")

courses=data.frame(course_id=0,slug=slugs,Title="",stringsAsFactors=FALSE)
save(courses, file='metacourses.rdata')


for(course_nb in 1:(nrow(courses))) 
{
 selectedCourse = courses[course_nb,]$slug
 
 
print(paste('Cours', course_nb,'/',nrow(courses),': ',selectedCourse))
setwd(paste(BaseURL,selectedCourse, sep='/'))

jsonstructure <- fromJSON(paste(selectedCourse,'json', sep='.'))
courses[course_nb,]$course_id=jsonstructure[["id"]]
courses[course_nb,]$Title=jsonstructure[["title"]]

id_counter = 0;
structure = data.frame(id=id_counter, part_id=jsonstructure$id, parent_id=0,title=jsonstructure$title, type=jsonstructure$subtype,slug=jsonstructure$slug, element_id=jsonstructure$elementId, course_id= courses[course_nb,]$course_id)

ntomes = nrow(jsonstructure$children)
if(ntomes>0)
for(t_counter in 1:ntomes){
 
  itome = as.data.frame(jsonstructure$children[t_counter,])
  tome.structure = data.frame(id=-99, part_id=itome$id, parent_id=structure[1,'part_id'],title=itome$title, type=itome$subtype,slug=itome$slug, element_id=itome$elementId,course_id= courses[course_nb,]$course_id)
  structure = rbind(structure , tome.structure)
  
  chaps= as.data.frame(itome$children)
    nchaps =  nrow(chaps)
  if(nchaps>0)
  for(ch_counter in 1:nchaps){
    id_counter = id_counter + 1
    ichap =  as.data.frame(chaps[ch_counter,])
    chap.structure = data.frame(id=id_counter, part_id=ichap$id, parent_id=itome$id,title=ichap$title, type=ichap$subtype,slug=ichap$slug, element_id=ichap$elementId,course_id= courses[course_nb,]$course_id)
    structure = rbind(structure , chap.structure)
    
    parts =  as.data.frame(ichap$children)
    npart = nrow(parts)
    
    if(npart>0)
    for(part_counter in 1:npart ){
      id_counter = id_counter + 1
      ipart =  as.data.frame(ichap$children)[part_counter,]
      part.structure = data.frame(id = id_counter, part_id=ipart$id, parent_id=ichap$id,title=ipart$title, type=ipart$subtype,slug=ipart$slug, element_id=ipart$elementId,course_id= courses[course_nb,]$course_id)
      structure = rbind(structure , part.structure)
    }
  }
  
}

save(structure, file="structure.rdata")

setwd(BaseURL)
save(courses, file='metacourses.rdata')

}

metacourses=courses
metacourses$Title=""
metacourses$code=""
metacourses[1,]=c("apprenez-le-fonctionnement-des-reseaux-tcp-ip","Apprenez le fonctionnement des réseaux TCP/IP","tcp")
metacourses[2,]=c("apprenez-a-programmer-en-python","Apprenez à programmer en Python","python")
metacourses[3,]=c("comment-financer-son-projet-solidaire","Comment financer son projet solidaire","projet")
metacourses[4,]=c("debutez-l-analyse-logicielle-avec-uml","Débutez l'analyse logicielle avec UML","uml")
metacourses[5,]=c("decouvrez-le-monde-des-start-ups","Découvrez le monde des start-ups","startups")
metacourses[6,]=c("developpez-votre-site-web-avec-le-framework-symfony2","Développez votre site web avec le framework Symfony2","symfony")
metacourses[7,]=c("financer-son-entreprise","Financer son entreprise","entreprise")
metacourses[8,]=c("gerer-son-code-avec-git-et-github","Gérer son code avec Git et GitHub","git")
metacourses[9,]=c("simplifiez-vos-reunions-grace-au-doodling","Simplifiez vos réunions grâce au Doodling","doodle")
metacourses[10,]=c("trouvez-un-job-qui-vous-correspond-1","Trouvez un job qui vous correspond ! #1","job")
courses = metacourses
setwd(BaseURL)
save(courses,file='metacourses.rdata')

}

###############  EXTRACT COURSE ###########################
extract_structure <- function(){

}