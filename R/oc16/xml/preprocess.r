setwd("~/dev/CoReaDa/R/oc16/xml")
options(stringsAsFactors=FALSE)
# Read the csv
library('Peirce')

selectedCourse='xml'

setwd(paste('/home/madjid/dev/CoReaDa/R/',selectedCourse, sep='/'))
#http://codebeautify.org/jsonviewer#
load('xml.rdata')
load('xml.structure.rdata')



xml[which(is.na(xml$user_id)),]$user_id=0
xml=xml[which(!is.na(xml$part_id)),]
xml=unique(xml)



part3count = nrow(xml.structure[which(xml.structure$type=='title-3'),])
xml.structure[which(xml.structure$type!='title-3'),]$part_index=0
xml.structure[which(xml.structure$type=='title-3'),]$part_index=1:part3count
save(xml.structure, file='xml.structure.rdata')

parts=unique(xml$part_id)
nparts=length(parts)

xml=merge(xml, xml.structure[which(xml.structure$type=='title-3'),c('part_index','part_id')], by='part_id')
xml=xml[order(xml$date),]  
rownames(xml)=1:nrow(xml)
xml$id=1:nrow(xml)
save(xml,file='xml.rdata')

xml$end=xml$date
xml$duration=NA
users = unique(unique(xml$user_id))
nusers=length(unique(xml$user_id))
# End calculation
for (i in 1:nusers)
{
  time = subset(xml, xml$user_id==users[i], select=c(id,date))
  l = (length(time$id))-1
  if(l==0) next;
  time=time[order(time$date),]  
  j=1
  for(j in 1:l)
  {
    
    currentID =time$id[j] 
    nextID = time$id[j+1]
    xml[which(xml$id==currentID),]$end = xml[which(xml$id==nextID),]$date
    duration = as.numeric(difftime(xml[which(xml$id==currentID),]$end,xml[which(xml$id==currentID),]$date, units = "secs"))
    xml[which(xml$id==currentID),]$duration = duration
    print(paste(i,'- duree = ',duration) )
    
  }   
}

save(xml,file='xml.rdata')

#Calcul des durees maximales des parties: couvrant 90% des obsels sur la partie
xml.structure$max.duration=NA
xml.structure$mean.duration=NA
xml.structure$median.duration=NA
xml.structure$q1.duration=NA
xml.structure$q3.duration=NA



# On exclut : durees nulles et -1
xml_with_duration = xml[which(xml$duration>=10 & xml$duration<2*3600),]#;c('part_id','duration')]
# On exclut les derniers de chaque session
#xml_with_duration = xml_with_duration[which(xml_with_duration$end > xml_with_duration$date),]
#xml_with_duration = xml_with_duration[which(xml_with_duration$duration < 3*3600),]
#Premiere winsorization a 4 heures
parts=unique(xml[["part_id"]])
nparts = length(parts)
for (i in 1:nparts)
{
  print(i)
  part_xml = subset(xml_with_duration, xml_with_duration$part_id==parts[i])
  part_xml=Peirce(part_xml$duration);
  maxD = round(as.numeric(max(part_xml)  ),2);
  
  xml.structure[which(xml.structure$part_id==parts[i]),]$max.duration=maxD
  xml[which(xml$part_id==parts[i] & ( xml$duration>maxD)),]$duration = NA
  
  xml.structure[which(xml.structure$part_id==parts[i]),]$max.duration=round(as.numeric(quantile(part_xml,9/10)  ),2)
  xml.structure[which(xml.structure$part_id==parts[i]),]$mean.duration=round(as.numeric(mean(part_xml)  ),2)
  xml.structure[which(xml.structure$part_id==parts[i]),]$median.duration=round(as.numeric(median(part_xml)  ),2)
  xml.structure[which(xml.structure$part_id==parts[i]),]$q1.duration=round(as.numeric(quantile(part_xml,1/4)  ),2)
  xml.structure[which(xml.structure$part_id==parts[i]),]$q3.duration=round(as.numeric(quantile(part_xml,3/4)  ),2)
  
}

#Aggregate for parents
parents = xml.structure[which(xml.structure$type=='title-2'),]
nparents = nrow(parents)
for(i in 1:nparents){
  children = xml.structure[which(xml.structure$paranetId==parents$part_id[i]),]
  xml.structure[which(xml.structure$part_id==parents$part_id[i]),]$max.duration = sum(children$max.duration)
  xml.structure[which(xml.structure$part_id==parents$part_id[i]),]$mean.duration = sum(children$mean.duration)
  xml.structure[which(xml.structure$part_id==parents$part_id[i]),]$median.duration = sum(children$median.duration)
  xml.structure[which(xml.structure$part_id==parents$part_id[i]),]$q1.duration = sum(children$q1.duration)
  xml.structure[which(xml.structure$part_id==parents$part_id[i]),]$q3.duration = sum(children$q3.duration)
}

parents = xml.structure[which(xml.structure$type=='title-1'),]
nparents = nrow(parents)
for(i in 1:nparents){
  children = xml.structure[which(xml.structure$paranetId==parents$part_id[i]),]
  xml.structure[which(xml.structure$part_id==parents$part_id[i]),]$max.duration = sum(children$max.duration)
  xml.structure[which(xml.structure$part_id==parents$part_id[i]),]$mean.duration = sum(children$mean.duration)
  xml.structure[which(xml.structure$part_id==parents$part_id[i]),]$median.duration = sum(children$median.duration)
  xml.structure[which(xml.structure$part_id==parents$part_id[i]),]$q1.duration = sum(children$q1.duration)
  xml.structure[which(xml.structure$part_id==parents$part_id[i]),]$q3.duration = sum(children$q3.duration)
}
parents = xml.structure[which(xml.structure$type=='course'),]
nparents = nrow(parents)
for(i in 1:nparents){
  children = xml.structure[which(xml.structure$paranetId==parents$part_id[i]),]
  xml.structure[which(xml.structure$part_id==parents$part_id[i]),]$max.duration = sum(children$max.duration)
  xml.structure[which(xml.structure$part_id==parents$part_id[i]),]$mean.duration = sum(children$mean.duration)
  xml.structure[which(xml.structure$part_id==parents$part_id[i]),]$median.duration = sum(children$median.duration)
  xml.structure[which(xml.structure$part_id==parents$part_id[i]),]$q1.duration = sum(children$q1.duration)
  xml.structure[which(xml.structure$part_id==parents$part_id[i]),]$q3.duration = sum(children$q3.duration)
}

save(xml.structure, file="xml.structure.rdata") 

save(xml, file="xml.rdata")

# Seance calculation

#1. FOR ALL SESSIONS
xml$seance = 1
users = unique(xml$user_id)
users=sort(users)

for (i in 1:nusers)
{
  print(i)
  user = subset(xml ,xml$user_id==users[i],  select=c(id,part_id, date, end, duration, seance))
  
  user=user[order(user$date),]
  
  nums =1
  user$seance=nums
  xml$seance[which(xml$user_id==users[i])]=nums
  l=length(user$date)-1
  
  if(l==0) next
  for(j in 1:l)
  {
    
    tDiff = as.numeric(difftime(user$end[j],user$date[j], units = "secs"))
    maxD=xml.structure$max.duration[which(xml.structure$part_id==user$part_id[j])] 
    if(is.na(user$date[j+1])) next
    if(tDiff> maxD )    nums=nums+1
    else
    {
      sessionDiff = as.numeric(difftime(user$date[j+1],user$date[j], units = "secs"))
      if((tDiff==0)&&(sessionDiff>maxD))  nums=nums+1
      
    }
    user$seance[j+1]=nums
    xml$seance[which(xml$id==user$id[j+1])]=user$seance[j+1]
    
  }
  
}
save(xml, file="xml.rdata")


######################### RS STATS ##################################################""
xml = xml[which(xml$user_id!=0),]
nusers=length(unique(xml[["user_id"]]))
users = unique(xml[["user_id"]])
users=sort(users)
unxml = xml[which(xml$user_id==0),]
nsessions=length(unique(unxml [["session_id"]]))
sessions = unique(unxml [["session_id"]])
sessions=sort(sessions)
courseSize = sum(xml.structure$size)

nRS=nrow(unique(subset(xml, select=c("user_id","seance")))) + 
  nrow(unique(subset(unxml, select=c("session_id","seance"))))
Users_RS = xml.frame(id = 1:nRS, user = 0, nparts = 0, nuniqueparts=0,  duration = 0)

cpt = 0
for(i in 1:nusers)
{
  user=xml[which(xml$user_id==users[i]),]
  seances = unique(user$seance)
  for(j in 1:length(seances))
  {
    seance = user[which(user$seance==seances[j]),]
    cpt = cpt +1
    Users_RS[which(Users_RS$id==cpt),]$user = users[i]
    Users_RS[which(Users_RS$id==cpt),]$nparts = length(seance$part_id)
    Users_RS[which(Users_RS$id==cpt),]$nuniqueparts = length(unique(seance$part_id))
    Users_RS[which(Users_RS$id==cpt),]$duration = sum(seance$duration)
  }
}
for(i in 1:nsessions)
{
  session=unxml[which(unxml$session_id==sessions[i]),]
  seances = unique(session$seance)
  for(j in 1:length(seances))
  {
    seance = session[which(session$seance==seances[j]),]
    cpt = cpt +1
    Users_RS[which(Users_RS$id==cpt),]$user = sessions[i]
    Users_RS[which(Users_RS$id==cpt),]$nparts = length(seance$part_id)
    Users_RS[which(Users_RS$id==cpt),]$nuniqueparts = length(unique(seance$part_id))
    Users_RS[which(Users_RS$id==cpt),]$duration = sum(seance$duration)
  }
}

save(Users_RS, file="xml.Users_RS.rdata")

########################

### INTEREST
#nRS
xml=xml[order(xml$date),]
allParts=xml.structure$part_id
xml.Interest = data.frame(part_id=allParts,  Actions_nb=0, Users_nb = 0,Sessions_nb=0, RS_nb = 0)
parts=unique(xml$part_id)
for(i in 1:(length(parts)))
{
  print(i)
  dataPart = xml[which(xml$part_id==parts[i]),]
  
  xml.Interest[which(xml.Interest$part_id==parts[i]),]=c(part_id=parts[i],
                                                     Actions_nb=length(dataPart$id),
                                                     Users_nb = length(unique(dataPart$user_id)),
                                                     Sessions_nb=length(unique(dataPart$session_id)),                                              
                                                     RS_nb = nrow(unique(dataPart[,c("user_id","seance")])));

  
}

#Aggregate for chapters

chapters = xml.structure[which(xml.structure$type=='title-2'),]$part_id
nchapters = length(unique(chapters))
for(i in 1:nchapters){
  children = xml.structure[which(xml.structure$paranetId==chapters[i]),]$part_id
 
  dataPart = xml[which(xml$part_id %in%children),]
  
  xml.Interest[which(xml.Interest$part_id==chapters[i]),]=c(part_id=chapters[i],
                                                               Actions_nb=length(dataPart$id),
                                                               Users_nb = length(unique(dataPart$user_id)),
                                                               Sessions_nb=length(unique(dataPart$session_id)),                                              
                                                               RS_nb = nrow(unique(dataPart[,c("user_id","seance")])));
 
}

#Aggregate for tomes
tomes = xml.structure[which(xml.structure$type=='title-1'),]$part_id
ntomes = length(unique(tomes))
for(i in 1:ntomes){
  children = xml.structure[which(xml.structure$paranetId==tomes[i]),]$part_id
  
  subchildren = xml.structure[which(xml.structure$paranetId%in%children),]$part_id
  
  
  dataPart = xml[which(xml$part_id %in%subchildren),]
  
  xml.Interest[which(xml.Interest$part_id==tomes[i]),]=c(part_id=tomes[i],
                                                                  Actions_nb=length(dataPart$id),
                                                                  Users_nb = length(unique(dataPart$user_id)),
                                                                  Sessions_nb=length(unique(dataPart$session_id)),                                              
                                                                  RS_nb = nrow(unique(dataPart[,c("user_id","seance")])));
  
}
#Aggregate for all course
courseId = xml.structure[which(xml.structure$type=='course'),]$part_id
xml.Interest[which(xml.Interest$part_id==courseId),]=c(part_id=courseId,
                                                             Actions_nb=length(xml$id),
                                                             Users_nb = length(unique(xml$user_id)),
                                                             Sessions_nb=length(unique(xml$session_id)),                                              
                                                             RS_nb = nrow(unique(xml[,c("user_id","seance")])));

xml.Interest = merge(xml.Interest, xml.structure[,c('part_index','part_id','type')])
save(xml.Interest, file="xml.Interest.rdata")


########################"Coverage
nRS=nrow(unique(subset(xml, select=c("user_id","seance"))))

RS = data.frame(id = 1:nRS,nparts = 0, duration = 0)

U=subset(xml, select=c("user_id","seance","part_id"))
users = unique(U$user_id)
nusers = length(users)
cpt = 0
for(i in 1:nusers)
{
  print(i)
  user=xml[which(xml$user_id==users[i]),]
  seances = unique(user$seance)
  for(j in 1:length(seances))
  {
    seance = user[which(user$seance==seances[j]),]
    cpt = cpt +1
    
    RS[which(RS$id==cpt),]$nparts = length(unique(seance$part_id))
  
    RS[which(RS$id==cpt),]$duration = sum(seance$duration, na.rm = TRUE)
    print(paste('duration: ',RS[which(RS$id==cpt),]$duration))
  #  RS[which(RS$id==cpt),]$parts[[1]] = list(seance$part_index)
   # RS[which(RS$id==cpt),]$dates[[1]] = list(seance$date)
  #  RS[which(RS$id==cpt),]$durations[[1]] = list(seance$duration)
    
  }
}
#RS$duration=round(RS$duration/60,1)
RS = RS[which(RS$duration>60),]
xml.RS = RS
save(xml.RS, file="xml.RS.rdata")



################ READS #####################################################"

library('plyr')
### Nombre de lecteurs (RDer), de relecteurs (Rereaders), de lectures (RDing) et de relectures (RRDing)
xml.Reads = data.frame(part_index=xml.structure$part_index,part_id=xml.structure$part_id,Actions_nb = 0, Readers=0,
                          Rereaders=0,Readings = 0, Rereadings = 0 )
parts=unique(xml$part_id)
nparts=length(parts)
for(i in 1:(nparts))
{
  rders = count(xml[which(xml$part_id==parts[i]),], "user_id")
  
  xml.Reads[which(xml.Reads$part_id==parts[i]),]$Actions_nb =nrow(xml[which(xml$part_id==parts[i]),])
  
  xml.Reads[which(xml.Reads$part_id==parts[i]),]$Readers =    length(rders$user_id)
  
  xml.Reads[which(xml.Reads$part_id==parts[i]),]$Rereaders =  length(rders[which(rders$freq>1),]$user_id) 
  
  rdings = count(xml[which(xml$part_id==parts[i]),], "id")
  xml.Reads[which(xml.Reads$part_id==parts[i]),]$Readings =   sum(rders$freq)
  
  xml.Reads[which(xml.Reads$part_id==parts[i]),]$Rereadings = sum(rders$freq)  - length(rders$user_id)   
  
}

### Nombre de relecture successive des parties
users=unique(xml$user_id)
nusers=length(users)
successive.rereads = data.frame(part_index=1:nparts, Sequential_rereadings = 0)
for (i in 1:nusers)
{
  print(i)
  user.seances = subset(xml, xml$user_id==users[i], select=c('seance','part_index','date'))
  user.seances=user.seances[order(user.seances$date),]
  seances=unique(user.seances[["seance"]])
  nseances=length(seances)
  
  for(j in 1:nseances)
  {
    seance = user.seances[which(user.seances$seance==seances[j]),]
    for(mm in 1:nparts){
      n = nrow(seance[which(seance$part_index==mm),])
      if(!is.null(n)){
        if(n>1) successive.rereads[which(successive.rereads$part_index==mm),]$Sequential_rereadings = successive.rereads[which(successive.rereads$part_index==mm),]$Sequential_rereadings +1
      }
    }
  }
}



xml.Reads = merge(xml.Reads,successive.rereads, by="part_index", all.x = TRUE)
 

###### RELECTURES DECALEES #########################


decaled.rereads = data.frame(part_index=1:nparts, Decaled_rereadings = 0)

for (i in 1:nusers)
{
  print(paste("USER: ",i))
  user.seances = subset(xml, xml$user_id==users[i], select=c(seance,part_index,date))
  user.seances=user.seances[order(user.seances$date),]
  nseances=length(unique(user.seances[["seance"]]))
  dr.by.user=vector(mode="numeric", length=nparts)
  for(mm in 1:nparts){
    
      res = length(unique(user.seances[which(user.seances$part_index==mm),]$seance) )
      add = 0
      if(!is.null(res))
        add = res - 1
      if(add>0)
        decaled.rereads[which(decaled.rereads$part_index==mm),]$Decaled_rereadings = decaled.rereads[which(decaled.rereads$part_index==mm),]$Decaled_rereadings + add
  }
  
}
xml.Reads = merge(xml.Reads,decaled.rereads, by="part_index", all.x = TRUE)

xml.Reads$Rereadings =  xml.Reads$Decaled_rereadings +  xml.Reads$Sequential_rereadings
# Aggregate for chapters
chapters = xml.structure[which(xml.structure$type=='title-2'),]$part_id
nchapters = length(unique(chapters))
for(i in 1:nchapters){
  children = xml.structure[which(xml.structure$paranetId==chapters[i]),]$part_id  
  xml.Reads[which(xml.Reads$part_id==chapters[i]),]$Readers = sum(xml.Reads[which(xml.Reads$part_id%in%children),]$Readers)
  xml.Reads[which(xml.Reads$part_id==chapters[i]),]$Actions_nb = sum(xml.Reads[which(xml.Reads$part_id%in%children),]$Actions_nb)
  xml.Reads[which(xml.Reads$part_id==chapters[i]),]$Rereaders =  mean(xml.Reads[which(xml.Reads$part_id%in%children),]$Rereaders)  
  xml.Reads[which(xml.Reads$part_id==chapters[i]),]$Readings =  mean(xml.Reads[which(xml.Reads$part_id%in%children),]$Readings)    
  xml.Reads[which(xml.Reads$part_id==chapters[i]),]$Rereadings = mean(xml.Reads[which(xml.Reads$part_id%in%children),]$Rereadings)  
  
}
# Aggregate for tomes
tomes = xml.structure[which(xml.structure$type=='title-1'),]$part_id
ntomes = length(unique(tomes))
for(i in 1:ntomes){
  first_children = xml.structure[which(xml.structure$paranetId==tomes[i]),]$part_id
  children = xml.structure[which(xml.structure$paranetId%in%first_children),]$part_id
  
  
  xml.Reads[which(xml.Reads$part_id==tomes[i]),]$Readers =  sum(xml.Reads[which(xml.Reads$part_id%in%children),]$Readers)
  xml.Reads[which(xml.Reads$part_id==tomes[i]),]$Actions_nb = sum(xml.Reads[which(xml.Reads$part_id%in%children),]$Actions_nb)
  xml.Reads[which(xml.Reads$part_id==tomes[i]),]$Rereaders =  mean(xml.Reads[which(xml.Reads$part_id%in%children),]$Rereaders)  
  xml.Reads[which(xml.Reads$part_id==tomes[i]),]$Readings =  mean(xml.Reads[which(xml.Reads$part_id%in%children),]$Readings)    
  xml.Reads[which(xml.Reads$part_id==tomes[i]),]$Rereadings = mean(xml.Reads[which(xml.Reads$part_id%in%children),]$Rereadings)  
  
}
courseId  = xml.structure[which(xml.structure$type=='course'),]$part_id
xml.Reads[which(xml.Reads$part_id==courseId),]$Readers =    length(unique(xml$user_id))

xml.Reads$rereadings_tx = xml.Reads$Rereadings / xml.Reads$Readings

xml.Reads$part_readers_rereaders = round(xml.Reads$Rereaders / xml.Reads$Readers, 4) 
xml.Reads$course_readers_rereaders = round(xml.Reads$Rereaders / nusers, 4) 
xml.Reads$rereads_seq_tx = round(100 * xml.Reads$Sequential_rereadings / xml.Reads$Rereadings,0)
xml.Reads$rereads_dec_tx = round(100 * xml.Reads$Decaled_rereadings / xml.Reads$Rereadings,0)
save(xml.Reads, file="xml.Reads.rdata")
##############################################"""
   
PartData$mean.tx_total_rereaders = round(100 * PartData$Rereaders / PartData$Readers, 2) 
PartData$mean.tx_total_readers = round(100 * PartData$Rereaders / nusers, 2) 
###### RUPTURE ##################"
xml.Ruptures= data.frame(user_id=numeric(), seance=integer(),part_index=integer(), recovery=logical(),
                        direct_recovery=logical(),next_recovery=logical(), distant_next_recovery=logical(),
                        prev_recovery=logical(), distant_prev_recovery=logical())
                         
users=unique(xml$user_id)
nusers=length(users)
for (i in 1:nusers)
{
  print(i)
  
  user = xml[which(xml$user_id==users[i]),]
  user=user[order(user$date),]
  user.seances=sort(unique(user$seance))
  
  for(j in 1:length(user.seances))
  {
    seance=user[which(user$seance==j),]
    end = seance[which(seance$id==max(seance$id)),]$part_index
    l.direct_recovery=FALSE
    l.next_recovery=FALSE
    l.distant_next_recovery = FALSE
    l.prev_recovery = FALSE
    l.distant_prev_recovery = FALSE
    
    disconnection= data.frame(user_id=users[i], seance=j,part_index=user$part_index[j],
                              direct_recovery=l.direct_recovery, distant_next_recovery=l.distant_next_recovery, 
                              next_recovery = l.next_recovery,
                              prev_recovery=l.prev_recovery, distant_prev_recovery=l.distant_prev_recovery  ) 
    
    
    if(j==length(user.seances)){xml.Ruptures=rbind(xml.Ruptures,disconnection)}
    else{      
      nextseance=user[which(user$seance==j+1),]
      nextbegin = nextseance[which(nextseance$id==min(nextseance$id)),]$part_index
      if(nextbegin==end) { disconnection$direct_recovery=TRUE}
      if(nextbegin>end+1) { disconnection$distant_next_recovery=TRUE}
      if(nextbegin==end+1) { disconnection$next_recovery=TRUE}
      if(nextbegin==end - 1) { disconnection$prev_recovery=TRUE}
      if(nextbegin<end - 1) { disconnection$distant_prev_recovery=TRUE}
     
    }
    xml.Ruptures=rbind(xml.Ruptures,disconnection)    
    
  }
  
}

rupture_parts=unique(xml.Ruptures$part_index)

norecovery_Ruptures=xml.Ruptures[which((!xml.Ruptures$direct_recovery)&
                                            (!xml.Ruptures$distant_next_recovery)&
                                            (!xml.Ruptures$next_recovery)&
                                            (!xml.Ruptures$prev_recovery)&
                                            (!xml.Ruptures$distant_prev_recovery)),]
xml.Ruptures$norecovery = 0
for(i in 1:length(rupture_parts))
{
  rupt = rupture_parts[i]
  xml.Ruptures[which(xml.Ruptures$part_index==rupt),]$norecovery = 
    nrow(norecovery_Ruptures[which(norecovery_Ruptures$part_index==rupt),])
}
recovery_Ruptures=xml.Ruptures[which((xml.Ruptures$direct_recovery)|
                        (xml.Ruptures$distant_next_recovery)|
                        (xml.Ruptures$next_recovery)|
                        (xml.Ruptures$prev_recovery)|
                        (xml.Ruptures$distant_prev_recovery)),]
xml.Ruptures$recovery = 0
for(i in 1:length(rupture_parts))
{
  rupt = rupture_parts[i]
  xml.Ruptures[which(xml.Ruptures$part_index==rupt),]$recovery = 
    nrow(recovery_Ruptures[which(recovery_Ruptures$part_index==rupt),])
} 
xml.Ruptures$rupture = xml.Ruptures$norecovery + xml.Ruptures$recovery

RupStats =data.frame(part_index=rupture_parts,  rupture=0, recovery=0,  norecovery=0,direct_recovery=0,
                     distant_next_recovery=0, next_recovery=0, prev_recovery=0, distant_prev_recovery=0) 
for(k in 1:length(rupture_parts))
{
  i = rupture_parts[k]
  RupStats[which(RupStats$part_index==i),]$rupture= max(xml.Ruptures[which(xml.Ruptures$part_index==i),]$rupture)
  RupStats[which(RupStats$part_index==i),]$recovery= max(xml.Ruptures[which(xml.Ruptures$part_index==i),]$recovery)
  RupStats[which(RupStats$part_index==i),]$norecovery= max(xml.Ruptures[which(xml.Ruptures$part_index==i),]$norecovery)
  RupStats[which(RupStats$part_index==i),]$distant_next_recovery= nrow(xml.Ruptures[which(xml.Ruptures$part_index==i & xml.Ruptures$distant_next_recovery),])
  RupStats[which(RupStats$part_index==i),]$next_recovery= nrow(xml.Ruptures[which(xml.Ruptures$part_index==i & xml.Ruptures$next_recovery),])
  RupStats[which(RupStats$part_index==i),]$prev_recovery= nrow(xml.Ruptures[which(xml.Ruptures$part_index==i & xml.Ruptures$prev_recovery),])
  RupStats[which(RupStats$part_index==i),]$distant_prev_recovery= nrow(xml.Ruptures[which(xml.Ruptures$part_index==i & xml.Ruptures$distant_prev_recovery),])
  RupStats[which(RupStats$part_index==i),]$direct_recovery= nrow(xml.Ruptures[which(xml.Ruptures$part_index==i & xml.Ruptures$direct_recovery),])
}

xml.Ruptures = merge(xml.structure[,c('part_index','part_id')],RupStats, all.x = TRUE )
# Aggregates

parents = xml.structure[which(xml.structure$type=='title-2'),]
nparents = nrow(parents)
for(i in 1:nparents){
  children = xml.structure[which(xml.structure$paranetId==parents$part_id[i]),]$part_id
  
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$rupture = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$rupture)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$norecovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$recovery)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$recovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$norecovery)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$distant_next_recovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$distant_next_recovery)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$next_recovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$next_recovery)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$prev_recovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$prev_recovery)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$distant_prev_recovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$distant_prev_recovery)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$direct_recovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$direct_recovery)
}

parents = xml.structure[which(xml.structure$type=='title-1'),]
nparents = nrow(parents)
for(i in 1:nparents){
  children = xml.structure[which(xml.structure$paranetId==parents$part_id[i]),]$part_id
  
  
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$rupture = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$rupture)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$norecovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$recovery)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$recovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$norecovery)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$distant_next_recovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$distant_next_recovery)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$next_recovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$next_recovery)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$prev_recovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$prev_recovery)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$distant_prev_recovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$distant_prev_recovery)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$direct_recovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$direct_recovery)
}
parents = xml.structure[which(xml.structure$type=='course'),]
nparents = nrow(parents)
for(i in 1:nparents){
  children = xml.structure[which(xml.structure$paranetId==parents$part_id[i]),]$part_id
  
  
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$rupture = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$rupture)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$norecovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$recovery)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$recovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$norecovery)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$distant_next_recovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$distant_next_recovery)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$next_recovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$next_recovery)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$prev_recovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$prev_recovery)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$distant_prev_recovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$distant_prev_recovery)
  xml.Ruptures[which(xml.Ruptures$part_id==parents$part_id[i]),]$direct_recovery = 
    sum( xml.Ruptures[which(xml.Ruptures$part_id%in%children),]$direct_recovery)
}

save(xml.Ruptures,file="xml.Ruptures.rdata")


######################Parts Follow ######################
parts=unique(xml$part_id)
nparts=length(parts)
xml.partFollow = matrix(nrow = nparts, ncol = nparts, data=0)
parPreceed = matrix(nrow = nparts, ncol = nparts, data=0)
for (u in 1:nusers)
{
  print(u)
  userData = subset(xml, xml$user_id==users[u], select=c(id,part_index))  
  userData=userData[order(userData$id),]
  for(i in 1:nrow(userData)-1)
  {
    xml.partFollow[userData[i,]$part_index, userData[i+1,]$part_index] =
      xml.partFollow[userData[i,]$part_index, userData[i+1,]$part_index] + 1
    
    parPreceed[userData[i+1,]$part_index, userData[i,]$part_index] =
      parPreceed[userData[i+1,]$part_index, userData[i,]$part_index] + 1  
  }
}

save(xml.partFollow, file="xml.partFollow.rdata")

######## Parents Follow
structure=xml.structure
chaps=data.frame(paranetId= unique(structure[which(structure$type=='title-2'),]$part_id))
chaps$chap_index=1:nrow(chaps)
chaps$tome_index=0


tomes = data.frame(tome_id= unique(structure[which(structure$type=='title-1'),]$part_id))
tomes$tome_index=1:nrow(tomes)

for(i in 1:nrow(chaps)){
  chap =   chaps[which(chaps$chap_index==i),]$paranetId
  parent = structure[which(structure$part_id==chap),]$paranetId
  parent_index = tomes[which(tomes$tome_id==parent),]$tome_index
  chaps[which(chaps$chap_index==i),]$tome_index=parent_index
}

xml.structure = merge(xml.structure, chaps, all.x = TRUE)
xml = merge(xml, xml.structure[,c('part_id','chap_index','tome_index')] , all.x = TRUE)

save(xml, file='xml.rdata')

save(xml.structure, file='xml.structure.rdata')

#ChapFollow
users = unique(xml$user_id)
nusers = length(users)

nchaps=nrow(chaps)
xml.chapFollow = matrix(nrow = nchaps, ncol = nchaps, data=0)

for (u in 1:nusers)
{
  print(u)
  userData = subset(xml, xml$user_id==users[u], select=c(id,chap_index))  
  userData=userData[order(userData$id),]
  userData = userData$chap_index
  
  for(i in 1:length(userData)-1)
  {
    xml.chapFollow[userData[i], userData[i+1]] =
      xml.chapFollow[userData[i], userData[i+1]]  + 1
  }
}
save(xml.chapFollow, file='xml.chapFollow.rdata')
#TomeFollow
users = unique(xml$user_id)
nusers = length(users)
tomes=unique(chaps$tome_index)
ntomes=length(tomes)
xml.tomeFollow = matrix(nrow = ntomes, ncol = ntomes, data=0)

for (u in 1:nusers)
{
  print(u)
  userData = subset(xml, xml$user_id==users[u], select=c(id,tome_index))  
  userData=userData[order(userData$id),]
  userData = userData$tome_index
  
  for(i in 1:length(userData)-1)
  {
    xml.tomeFollow[userData[i], userData[i+1]] =
      xml.tomeFollow[userData[i], userData[i+1]]  + 1
  }
}
save(xml.tomeFollow, file='xml.tomeFollow.rdata')

### Taux avancement ###########
#s =  structure[structure$type=='title-3',c('part_id','title')]
#achievData = merge(xml, s, by='part_id')

nparts = length(unique(xml$part_id))
xml.achievement =data.frame(user_id=users,taux=0)
for(i in 1:nusers){
  xml.achievement[which(xml.achievement$user_id==users[i]),]$taux = round(length(unique(xml[which(xml$user_id==users[i]),]$part_id)) / nparts,2)
}
save( xml.achievement, file='xml.achievement.rdata')