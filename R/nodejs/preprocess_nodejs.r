setwd("~/dev/CoReaDa/R/nodejs")
options(stringsAsFactors=FALSE)
# Read the csv
library('Peirce')

selectedCourse='nodejs'

setwd(paste('/home/madjid/dev/CoReaDa/R/',selectedCourse, sep='/'))
#http://codebeautify.org/jsonviewer#
load('nodejs.rdata')
load('course.structure.rdata')



nodejs[which(is.na(nodejs$user_id)),]$user_id=0
nodejs=nodejs[which(!is.na(nodejs$part_id)),]
nodejs=unique(nodejs)

names(course.structure)[1]='part_index'
nodejs.structure=course.structure

part3count = nrow(nodejs.structure[which(nodejs.structure$type=='title-3'),])
nodejs.structure[which(nodejs.structure$type!='title-3'),]$part_index=0
nodejs.structure[which(nodejs.structure$type=='title-3'),]$part_index=1:part3count
save(nodejs.structure, file='nodejs.structure.rdata')

parts=unique(nodejs$part_id)
nparts=length(parts)

nodejs=merge(nodejs, nodejs.structure[which(nodejs.structure$type=='title-3'),c('part_index','part_id')], by='part_id')
nodejs=nodejs[order(nodejs$date),]  
rownames(nodejs)=1:nrow(nodejs)
nodejs$id=1:nrow(nodejs)
save(nodejs,file='nodejs.rdata')

nodejs$end=nodejs$date
nodejs$duration=NA
users = unique(unique(nodejs$user_id))
nusers=length(unique(nodejs$user_id))
# End calculation
for (i in 1:nusers)
{
  time = subset(nodejs, nodejs$user_id==users[i], select=c(id,date))
  l = (length(time$id))-1
  if(l==0) next;
  time=time[order(time$date),]  
  j=1
  for(j in 1:l)
  {
    
    currentID =time$id[j] 
    nextID = time$id[j+1]
    nodejs[which(nodejs$id==currentID),]$end = nodejs[which(nodejs$id==nextID),]$date
    duration = as.numeric(difftime(nodejs[which(nodejs$id==currentID),]$end,nodejs[which(nodejs$id==currentID),]$date, units = "secs"))
    nodejs[which(nodejs$id==currentID),]$duration = duration
    print(paste(i,'- duree = ',duration) )
    
  }   
}

save(nodejs,file='nodejs.rdata')

#Calcul des durees maximales des parties: couvrant 90% des obsels sur la partie
nodejs.structure$max.duration=NA
nodejs.structure$mean.duration=NA
nodejs.structure$median.duration=NA
nodejs.structure$q1.duration=NA
nodejs.structure$q3.duration=NA



# On exclut : durees nulles et -1
nodejs_with_duration = nodejs[which(nodejs$duration>=10 & nodejs$duration<2*3600),]#;c('part_id','duration')]
# On exclut les derniers de chaque session
#nodejs_with_duration = nodejs_with_duration[which(nodejs_with_duration$end > nodejs_with_duration$date),]
#nodejs_with_duration = nodejs_with_duration[which(nodejs_with_duration$duration < 3*3600),]
#Premiere winsorization a 4 heures
parts=unique(nodejs[["part_id"]])
nparts = length(parts)
for (i in 1:nparts)
{
  print(i)
  part_nodejs = subset(nodejs_with_duration, nodejs_with_duration$part_id==parts[i])
  part_nodejs=Peirce(part_nodejs$duration);
  maxD = round(as.numeric(max(part_nodejs)  ),2);
  
  nodejs.structure[which(nodejs.structure$part_id==parts[i]),]$max.duration=maxD
  nodejs[which(nodejs$part_id==parts[i] & ( nodejs$duration>maxD)),]$duration = NA
  
  nodejs.structure[which(nodejs.structure$part_id==parts[i]),]$max.duration=round(as.numeric(quantile(part_nodejs,9/10)  ),2)
  nodejs.structure[which(nodejs.structure$part_id==parts[i]),]$mean.duration=round(as.numeric(mean(part_nodejs)  ),2)
  nodejs.structure[which(nodejs.structure$part_id==parts[i]),]$median.duration=round(as.numeric(median(part_nodejs)  ),2)
  nodejs.structure[which(nodejs.structure$part_id==parts[i]),]$q1.duration=round(as.numeric(quantile(part_nodejs,1/4)  ),2)
  nodejs.structure[which(nodejs.structure$part_id==parts[i]),]$q3.duration=round(as.numeric(quantile(part_nodejs,3/4)  ),2)
  
}

#Aggregate for parents
parents = nodejs.structure[which(nodejs.structure$type=='title-2'),]
nparents = nrow(parents)
for(i in 1:nparents){
  children = nodejs.structure[which(nodejs.structure$parent_id==parents$part_id[i]),]
  nodejs.structure[which(nodejs.structure$part_id==parents$part_id[i]),]$max.duration = sum(children$max.duration)
  nodejs.structure[which(nodejs.structure$part_id==parents$part_id[i]),]$mean.duration = sum(children$mean.duration)
  nodejs.structure[which(nodejs.structure$part_id==parents$part_id[i]),]$median.duration = sum(children$median.duration)
  nodejs.structure[which(nodejs.structure$part_id==parents$part_id[i]),]$q1.duration = sum(children$q1.duration)
  nodejs.structure[which(nodejs.structure$part_id==parents$part_id[i]),]$q3.duration = sum(children$q3.duration)
}

parents = nodejs.structure[which(nodejs.structure$type=='title-1'),]
nparents = nrow(parents)
for(i in 1:nparents){
  children = nodejs.structure[which(nodejs.structure$parent_id==parents$part_id[i]),]
  nodejs.structure[which(nodejs.structure$part_id==parents$part_id[i]),]$max.duration = sum(children$max.duration)
  nodejs.structure[which(nodejs.structure$part_id==parents$part_id[i]),]$mean.duration = sum(children$mean.duration)
  nodejs.structure[which(nodejs.structure$part_id==parents$part_id[i]),]$median.duration = sum(children$median.duration)
  nodejs.structure[which(nodejs.structure$part_id==parents$part_id[i]),]$q1.duration = sum(children$q1.duration)
  nodejs.structure[which(nodejs.structure$part_id==parents$part_id[i]),]$q3.duration = sum(children$q3.duration)
}
parents = nodejs.structure[which(nodejs.structure$type=='course'),]
nparents = nrow(parents)
for(i in 1:nparents){
  children = nodejs.structure[which(nodejs.structure$parent_id==parents$part_id[i]),]
  nodejs.structure[which(nodejs.structure$part_id==parents$part_id[i]),]$max.duration = sum(children$max.duration)
  nodejs.structure[which(nodejs.structure$part_id==parents$part_id[i]),]$mean.duration = sum(children$mean.duration)
  nodejs.structure[which(nodejs.structure$part_id==parents$part_id[i]),]$median.duration = sum(children$median.duration)
  nodejs.structure[which(nodejs.structure$part_id==parents$part_id[i]),]$q1.duration = sum(children$q1.duration)
  nodejs.structure[which(nodejs.structure$part_id==parents$part_id[i]),]$q3.duration = sum(children$q3.duration)
}

save(nodejs.structure, file="nodejs.structure.rdata") 

save(nodejs, file="nodejs.rdata")

# Seance calculation

#1. FOR ALL SESSIONS
nodejs$seance = 1
users = unique(nodejs$user_id)
users=sort(users)

for (i in 1:nusers)
{
  print(i)
  user = subset(nodejs ,nodejs$user_id==users[i],  select=c(id,part_id, date, end, duration, seance))
  
  user=user[order(user$date),]
  
  nums =1
  user$seance=nums
  nodejs$seance[which(nodejs$user_id==users[i])]=nums
  l=length(user$date)-1
  
  if(l==0) next
  for(j in 1:l)
  {
    
    tDiff = as.numeric(difftime(user$end[j],user$date[j], units = "secs"))
    maxD=nodejs.structure$max.duration[which(nodejs.structure$part_id==user$part_id[j])] 
    if(is.na(user$date[j+1])) next
    if(tDiff> maxD )    nums=nums+1
    else
    {
      sessionDiff = as.numeric(difftime(user$date[j+1],user$date[j], units = "secs"))
      if((tDiff==0)&&(sessionDiff>maxD))  nums=nums+1
      
    }
    user$seance[j+1]=nums
    nodejs$seance[which(nodejs$id==user$id[j+1])]=user$seance[j+1]
    
  }
  
}
save(nodejs, file="nodejs.rdata")


######################### RS STATS ##################################################""
nodejs = nodejs[which(nodejs$user_id!=0),]
nusers=length(unique(nodejs[["user_id"]]))
users = unique(nodejs[["user_id"]])
users=sort(users)
unnodejs = nodejs[which(nodejs$user_id==0),]
nsessions=length(unique(unnodejs [["session_id"]]))
sessions = unique(unnodejs [["session_id"]])
sessions=sort(sessions)
courseSize = sum(nodejs.structure$size)

nRS=nrow(unique(subset(nodejs, select=c("user_id","seance")))) + 
  nrow(unique(subset(unnodejs, select=c("session_id","seance"))))
Users_RS = nodejs.frame(id = 1:nRS, user = 0, nparts = 0, nuniqueparts=0,  duration = 0)

cpt = 0
for(i in 1:nusers)
{
  user=nodejs[which(nodejs$user_id==users[i]),]
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
  session=unnodejs[which(unnodejs$session_id==sessions[i]),]
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

save(Users_RS, file="nodejs.Users_RS.rdata")

########################

### INTEREST
#nRS
nodejs=nodejs[order(nodejs$date),]
allParts=nodejs.structure$part_id
nodejs.Interest = data.frame(part_id=allParts,  Actions_nb=0, Users_nb = 0,Sessions_nb=0, RS_nb = 0)
parts=unique(nodejs$part_id)
for(i in 1:(length(parts)))
{
  print(i)
  dataPart = nodejs[which(nodejs$part_id==parts[i]),]
  
  nodejs.Interest[which(nodejs.Interest$part_id==parts[i]),]=c(part_id=parts[i],
                                                     Actions_nb=length(dataPart$id),
                                                     Users_nb = length(unique(dataPart$user_id)),
                                                     Sessions_nb=length(unique(dataPart$session_id)),                                              
                                                     RS_nb = nrow(unique(dataPart[,c("user_id","seance")])));

  
}

#Aggregate for chapters
names(nodejs.structure)[3]='parent_id'
chapters = nodejs.structure[which(nodejs.structure$type=='title-2'),]$part_id
nchapters = length(unique(chapters))
for(i in 1:nchapters){
  children = nodejs.structure[which(nodejs.structure$parent_id==chapters[i]),]$part_id
 
  dataPart = nodejs[which(nodejs$part_id %in%children),]
  
  nodejs.Interest[which(nodejs.Interest$part_id==chapters[i]),]=c(part_id=chapters[i],
                                                               Actions_nb=length(dataPart$id),
                                                               Users_nb = length(unique(dataPart$user_id)),
                                                               Sessions_nb=length(unique(dataPart$session_id)),                                              
                                                               RS_nb = nrow(unique(dataPart[,c("user_id","seance")])));
 
}

#Aggregate for tomes
tomes = nodejs.structure[which(nodejs.structure$type=='title-1'),]$part_id
ntomes = length(unique(tomes))
for(i in 1:ntomes){
  children = nodejs.structure[which(nodejs.structure$parent_id==tomes[i]),]$part_id
  
  subchildren = nodejs.structure[which(nodejs.structure$parent_id%in%children),]$part_id
  
  
  dataPart = nodejs[which(nodejs$part_id %in%subchildren),]
  
  nodejs.Interest[which(nodejs.Interest$part_id==tomes[i]),]=c(part_id=tomes[i],
                                                                  Actions_nb=length(dataPart$id),
                                                                  Users_nb = length(unique(dataPart$user_id)),
                                                                  Sessions_nb=length(unique(dataPart$session_id)),                                              
                                                                  RS_nb = nrow(unique(dataPart[,c("user_id","seance")])));
  
}
#Aggregate for all course
courseId = nodejs.structure[which(nodejs.structure$type=='course'),]$part_id
nodejs.Interest[which(nodejs.Interest$part_id==courseId),]=c(part_id=courseId,
                                                             Actions_nb=length(nodejs$id),
                                                             Users_nb = length(unique(nodejs$user_id)),
                                                             Sessions_nb=length(unique(nodejs$session_id)),                                              
                                                             RS_nb = nrow(unique(nodejs[,c("user_id","seance")])));

nodejs.Interest = merge(nodejs.Interest, nodejs.structure[,c('part_index','part_id','type')])
save(nodejs.Interest, file="nodejs.Interest.rdata")


########################"Coverage
nRS=nrow(unique(subset(nodejs, select=c("user_id","seance"))))

RS = data.frame(id = 1:nRS,nparts = 0, nsessions = 0, duration = 0)

U=subset(nodejs, select=c("user_id","seance","part_id","session_id"))
users = unique(U$user_id)
nusers = length(users)
cpt = 0
for(i in 1:nusers)
{
  print(i)
  user=nodejs[which(nodejs$user_id==users[i]),]
  seances = unique(user$seance)
  for(j in 1:length(seances))
  {
    seance = user[which(user$seance==seances[j]),]
    cpt = cpt +1
    
    RS[which(RS$id==cpt),]$nparts = length(unique(seance$part_id))
    RS[which(RS$id==cpt),]$nsessions = length(seance$session_id)
    RS[which(RS$id==cpt),]$duration = sum(seance$duration, na.rm = TRUE)
    print(paste('duration: ',RS[which(RS$id==cpt),]$duration))
  #  RS[which(RS$id==cpt),]$parts[[1]] = list(seance$part_index)
   # RS[which(RS$id==cpt),]$dates[[1]] = list(seance$date)
  #  RS[which(RS$id==cpt),]$durations[[1]] = list(seance$duration)
    
  }
}
#RS$duration=round(RS$duration/60,1)
RS = RS[which(RS$duration>60),]
nodejs.RS = RS
save(nodejs.RS, file="nodejs.RS.rdata")



################ READS #####################################################"
library(reshape2)
library(plyr)
library(data.table)

### Nombre de lecteurs (RDer), de relecteurs (Rereaders), de lectures (RDing) et de relectures (RRDing)
nodejs.Reads = data.frame(part_index=nodejs.structure$part_index,part_id=nodejs.structure$part_id,Readers=0,
                          Rereaders=0,Readings = 0, Rereadings = 0 )
parts=unique(nodejs$part_id)
nparts=length(parts)
for(i in 1:(nparts))
{
  rders = count(nodejs[which(nodejs$part_id==parts[i]),], "user_id")
  nodejs.Reads[which(nodejs.Reads$part_id==parts[i]),]$Readers =    length(rders$user_id)
  
  nodejs.Reads[which(nodejs.Reads$part_id==parts[i]),]$Rereaders =  length(rders[which(rders$freq>1),]$user_id) 
  
  rdings = count(nodejs[which(nodejs$part_id==parts[i]),], "id")
  nodejs.Reads[which(nodejs.Reads$part_id==parts[i]),]$Readings =   sum(rders$freq)
  
  nodejs.Reads[which(nodejs.Reads$part_id==parts[i]),]$Rereadings = sum(rders$freq)  - length(rders$user_id)   
  
}
# Aggregate for chapters
chapters = nodejs.structure[which(nodejs.structure$type=='title-2'),]$part_id
nchapters = length(unique(chapters))
for(i in 1:nchapters){
  children = nodejs.structure[which(nodejs.structure$parent_id==chapters[i]),]$part_id  
  nodejs.Reads[which(nodejs.Reads$part_id==chapters[i]),]$Readers = mean(nodejs.Reads[which(nodejs.Reads$part_id%in%children),]$Readers)
    length(rders$user_id)
  nodejs.Reads[which(nodejs.Reads$part_id==chapters[i]),]$Rereaders =  mean(nodejs.Reads[which(nodejs.Reads$part_id%in%children),]$Readers)  
  nodejs.Reads[which(nodejs.Reads$part_id==chapters[i]),]$Readings =  mean(nodejs.Reads[which(nodejs.Reads$part_id%in%children),]$Readers)    
  nodejs.Reads[which(nodejs.Reads$part_id==chapters[i]),]$Rereadings = mean(nodejs.Reads[which(nodejs.Reads$part_id%in%children),]$Readers)  
  
}
# Aggregate for tomes
tomes = nodejs.structure[which(nodejs.structure$type=='title-1'),]$part_id
ntomes = length(unique(tomes))
for(i in 1:ntomes){
  first_children = nodejs.structure[which(nodejs.structure$parent_id==tomes[i]),]$part_id
  children = nodejs.structure[which(nodejs.structure$parent_id%in%first_children),]$part_id
  

  nodejs.Reads[which(nodejs.Reads$part_id==tomes[i]),]$Readers = 
    mean(nodejs.Reads[which(nodejs.Reads$part_id%in%children),]$Readers)
  length(rders$user_id)
  nodejs.Reads[which(nodejs.Reads$part_id==tomes[i]),]$Rereaders =  mean(nodejs.Reads[which(nodejs.Reads$part_id%in%children),]$Readers)  
  nodejs.Reads[which(nodejs.Reads$part_id==tomes[i]),]$Readings =  mean(nodejs.Reads[which(nodejs.Reads$part_id%in%children),]$Readers)    
  nodejs.Reads[which(nodejs.Reads$part_id==tomes[i]),]$Rereadings = mean(nodejs.Reads[which(nodejs.Reads$part_id%in%children),]$Readers)  
  
}
courseId  = nodejs.structure[which(nodejs.structure$type=='course'),]$part_id
nodejs.Reads[which(nodejs.Reads$part_id==courseId),]$Readers =    length(unique(nodejs$user_id))





### Nombre de relecture successive des parties
successive.rereads = as.data.table(setNames(replicate(nparts,numeric(0), simplify = F), 1:nparts))
for (i in 1:nusers)
{
  sr.by.user = vector(mode="numeric", length=nparts)
  print(paste("USER: ",i))
  user.seances = subset(nodejs, nodejs$user_id==users[i], select=c('seance','part_index','date'))
  user.seances=user.seances[order(user.seances$date),]
  nseances=length(unique(user.seances[["seance"]]))
  sr.by.seance =vector(mode="numeric", length=nparts)
  
  for(j in 1:nseances)
  {
    print(paste("user: ",i," seance: ",j))
    seance = subset(user.seances, user.seances$seance==j, select=c(part_index))
    
    
    
    sr.by.seance =vector(mode="numeric", length=nparts)    
    for (k in 1:length(seance[,1]) )
    {
      sr.by.seance[seance[k,1]]=sr.by.seance[seance[k,1]]+1
    }
    
    sr.by.seance[which(sr.by.seance==0)]=NA
    
    sr.by.seance[which(sr.by.seance>0)]=sr.by.seance[which(sr.by.seance>0)]-1
    sr.by.user  = sr.by.user + sr.by.seance
    
    
  }
  
  
  
  sr.by.user=as.data.table(t(sr.by.user))
  setnames(sr.by.user,as.character(c(1:nparts)))
  
  successive.rereads=rbind(successive.rereads,sr.by.user)
}



successive.rereads = data.table(t(successive.rereads))
successive.rereads=successive.rereads[, list(Sequential_rereadings = rowSums(successive.rereads, na.rm=TRUE)) ]
successive.rereads=successive.rereads[ , ':='( part_index = 1:.N )  ]
successive.rereads=successive.rereads[,c("part_index","Sequential_rereadings"), with=FALSE]

nodejs.Reads = merge(nodejs.Reads,successive.rereads, by="part_index", all.x = TRUE)
 

###### RELECTURES DECALEES #########################

decaled.rereads = as.data.table(setNames(replicate(nparts,numeric(0), simplify = F), 1:nparts))

for (i in 1:nusers)
{
  print(paste("USER: ",i))
  user.seances = subset(nodejs, nodejs$user_id==users[i], select=c(seance,part_index,date))
  user.seances=user.seances[order(user.seances$date),]
  nseances=length(unique(user.seances[["seance"]]))
  dr.by.user=vector(mode="numeric", length=nparts)
  
  
  for(j in 1:nseances)
  {
    print(paste("user: ",i," seance: ",j))
    seance = subset(user.seances, user.seances$seance==j, select=c(part_index))
    
    dr.by.seance =vector(mode="numeric", length=nparts)
    
    
    for (l in 1:length(seance[,1]) )
    {
      
      t = subset(user.seances, (user.seances$seance > j & user.seances$part_index == l), select=c(part_index))
      if(length(t[,1]) > 0) dr.by.seance[seance[l,1]]=dr.by.seance [seance[l,1]]+1
    }
    dr.by.user  = dr.by.user + dr.by.seance   
    
  }
  
  
  dr.by.user=as.data.table(t(dr.by.user))  
  setnames(dr.by.user,as.character(c(1:nparts)))  
  decaled.rereads=rbind(decaled.rereads,dr.by.user)
  
  
}


decaled.rereads = data.table(t(decaled.rereads))
decaled.rereads=decaled.rereads[, list(Decaled_rereadings = rowSums(decaled.rereads, na.rm=TRUE)) ]
decaled.rereads[ , ':='( part_index = 1:.N )  ]
decaled.rereads=decaled.rereads[,c("part_index","Decaled_rereadings"), with=FALSE]

nodejs.Reads = merge(nodejs.Reads,decaled.rereads, by="part_index", all.x = TRUE)
#Reads= Reads[,c(1,2,3,4,5,6,7,8)]
nodejs.Reads$rereadings_tx = nodejs.Reads$Rereadings / nodejs.Reads$Readings
nodejs.Reads$seq_rereads_tx = round((nodejs.Reads$Sequential_rereadings / nodejs.Reads$Readings) * nodejs.Reads$mean.rereads, 4) 
nodejs.Reads$dec_rereads_tx = round((nodejs.Reads$Decaled_rereadings / nodejs.Reads$Readings) * nodejs.Reads$mean.rereads, 4) 
nodejs.Reads$part_readers_rereaders = round(nodejs.Reads$Rereaders / nodejs.Reads$Readers, 4) 
nodejs.Reads$course_readers_rereaders = round(nodejs.Reads$Rereaders / nusers, 4) 
save(nodejs.Reads, file="nodejs.Reads.rdata")
##############################################"""

PartData$mean.tx_total_rereaders = round(100 * PartData$Rereaders / PartData$Readers, 2) 
PartData$mean.tx_total_readers = round(100 * PartData$Rereaders / nusers, 2) 
###### RUPTURE ##################"
nodejs.Ruptures= data.frame(user_id=numeric(), seance=integer(),part_index=integer(), recovery=logical(),
                        direct_recovery=logical(),next_recovery=logical(), distant_next_recovery=logical(),
                        prev_recovery=logical(), distant_prev_recovery=logical())
                         
users=unique(nodejs$user_id)
nusers=length(users)
for (i in 1:nusers)
{
  print(i)
  
  user = nodejs[which(nodejs$user_id==users[i]),]
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
    
    
    if(j==length(user.seances)){nodejs.Ruptures=rbind(nodejs.Ruptures,disconnection)}
    else{      
      nextseance=user[which(user$seance==j+1),]
      nextbegin = nextseance[which(nextseance$id==min(nextseance$id)),]$part_index
      if(nextbegin==end) { disconnection$direct_recovery=TRUE}
      if(nextbegin>end+1) { disconnection$distant_next_recovery=TRUE}
      if(nextbegin==end+1) { disconnection$next_recovery=TRUE}
      if(nextbegin==end - 1) { disconnection$prev_recovery=TRUE}
      if(nextbegin<end - 1) { disconnection$distant_prev_recovery=TRUE}
     
    }
    nodejs.Ruptures=rbind(nodejs.Ruptures,disconnection)    
    
  }
  
}

rupture_parts=unique(nodejs.Ruptures$part_index)

norecovery_Ruptures=nodejs.Ruptures[which((!nodejs.Ruptures$direct_recovery)&
                                            (!nodejs.Ruptures$distant_next_recovery)&
                                            (!nodejs.Ruptures$next_recovery)&
                                            (!nodejs.Ruptures$prev_recovery)&
                                            (!nodejs.Ruptures$distant_prev_recovery)),]
nodejs.Ruptures$norecovery = 0
for(i in 1:length(rupture_parts))
{
  rupt = rupture_parts[i]
  nodejs.Ruptures[which(nodejs.Ruptures$part_index==rupt),]$norecovery = 
    nrow(norecovery_Ruptures[which(norecovery_Ruptures$part_index==rupt),])
}
recovery_Ruptures=nodejs.Ruptures[which((nodejs.Ruptures$direct_recovery)|
                        (nodejs.Ruptures$distant_next_recovery)|
                        (nodejs.Ruptures$next_recovery)|
                        (nodejs.Ruptures$prev_recovery)|
                        (nodejs.Ruptures$distant_prev_recovery)),]
nodejs.Ruptures$recovery = 0
for(i in 1:length(rupture_parts))
{
  rupt = rupture_parts[i]
  nodejs.Ruptures[which(nodejs.Ruptures$part_index==rupt),]$recovery = 
    nrow(recovery_Ruptures[which(recovery_Ruptures$part_index==rupt),])
} 
nodejs.Ruptures$rupture = nodejs.Ruptures$norecovery + nodejs.Ruptures$recovery

RupStats =data.frame(part_index=rupture_parts,  rupture=0, recovery=0,  norecovery=0,direct_recovery=0,
                     distant_next_recovery=0, next_recovery=0, prev_recovery=0, distant_prev_recovery=0) 
for(k in 1:length(rupture_parts))
{
  i = rupture_parts[k]
  RupStats[which(RupStats$part_index==i),]$rupture= max(nodejs.Ruptures[which(nodejs.Ruptures$part_index==i),]$rupture)
  RupStats[which(RupStats$part_index==i),]$recovery= max(nodejs.Ruptures[which(nodejs.Ruptures$part_index==i),]$recovery)
  RupStats[which(RupStats$part_index==i),]$norecovery= max(nodejs.Ruptures[which(nodejs.Ruptures$part_index==i),]$norecovery)
  RupStats[which(RupStats$part_index==i),]$distant_next_recovery= nrow(nodejs.Ruptures[which(nodejs.Ruptures$part_index==i & nodejs.Ruptures$distant_next_recovery),])
  RupStats[which(RupStats$part_index==i),]$next_recovery= nrow(nodejs.Ruptures[which(nodejs.Ruptures$part_index==i & nodejs.Ruptures$next_recovery),])
  RupStats[which(RupStats$part_index==i),]$prev_recovery= nrow(nodejs.Ruptures[which(nodejs.Ruptures$part_index==i & nodejs.Ruptures$prev_recovery),])
  RupStats[which(RupStats$part_index==i),]$distant_prev_recovery= nrow(nodejs.Ruptures[which(nodejs.Ruptures$part_index==i & nodejs.Ruptures$distant_prev_recovery),])
  RupStats[which(RupStats$part_index==i),]$direct_recovery= nrow(nodejs.Ruptures[which(nodejs.Ruptures$part_index==i & nodejs.Ruptures$direct_recovery),])
}

nodejs.Ruptures = merge(nodejs.structure[,c('part_index','part_id')],RupStats, all.x = TRUE )
# Aggregates

parents = nodejs.structure[which(nodejs.structure$type=='title-2'),]
nparents = nrow(parents)
for(i in 1:nparents){
  children = nodejs.structure[which(nodejs.structure$parent_id==parents$part_id[i]),]$part_id
  
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$rupture = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$rupture)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$norecovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$recovery)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$recovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$norecovery)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$distant_next_recovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$distant_next_recovery)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$next_recovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$next_recovery)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$prev_recovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$prev_recovery)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$distant_prev_recovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$distant_prev_recovery)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$direct_recovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$direct_recovery)
}

parents = nodejs.structure[which(nodejs.structure$type=='title-1'),]
nparents = nrow(parents)
for(i in 1:nparents){
  children = nodejs.structure[which(nodejs.structure$parent_id==parents$part_id[i]),]$part_id
  
  
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$rupture = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$rupture)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$norecovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$recovery)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$recovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$norecovery)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$distant_next_recovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$distant_next_recovery)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$next_recovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$next_recovery)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$prev_recovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$prev_recovery)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$distant_prev_recovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$distant_prev_recovery)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$direct_recovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$direct_recovery)
}
parents = nodejs.structure[which(nodejs.structure$type=='course'),]
nparents = nrow(parents)
for(i in 1:nparents){
  children = nodejs.structure[which(nodejs.structure$parent_id==parents$part_id[i]),]$part_id
  
  
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$rupture = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$rupture)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$norecovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$recovery)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$recovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$norecovery)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$distant_next_recovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$distant_next_recovery)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$next_recovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$next_recovery)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$prev_recovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$prev_recovery)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$distant_prev_recovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$distant_prev_recovery)
  nodejs.Ruptures[which(nodejs.Ruptures$part_id==parents$part_id[i]),]$direct_recovery = 
    sum( nodejs.Ruptures[which(nodejs.Ruptures$part_id%in%children),]$direct_recovery)
}

save(nodejs.Ruptures,file="nodejs.Ruptures.rdata")


### Parts Follow ###########
parts=unique(nodejs$part_id)
nparts=length(parts)
nodejs.partFollow = matrix(nrow = nparts, ncol = nparts, data=0)
parPreceed = matrix(nrow = nparts, ncol = nparts, data=0)
for (u in 1:nusers)
{
  print(u)
  userData = subset(nodejs, nodejs$user_id==users[u], select=c(id,part_index))  
  userData=userData[order(userData$id),]
  for(i in 1:nrow(userData)-1)
  {
    nodejs.partFollow[userData[i,]$part_index, userData[i+1,]$part_index] =
      nodejs.partFollow[userData[i,]$part_index, userData[i+1,]$part_index] + 1
    
    parPreceed[userData[i+1,]$part_index, userData[i,]$part_index] =
      parPreceed[userData[i+1,]$part_index, userData[i,]$part_index] + 1  
  }
}

save(nodejs.partFollow, file="nodejs.partFollow.rdata")



### Taux avancement ###########
#s =  structure[structure$type=='title-3',c('part_id','title')]
#achievData = merge(nodejs, s, by='part_id')

nparts = length(unique(nodejs$part_id))
nodejs.achievement =data.frame(user_id=users,taux=0)
for(i in 1:nusers){
  nodejs.achievement[which(nodejs.achievement$user_id==users[i]),]$taux = round(length(unique(nodejs[which(nodejs$user_id==users[i]),]$part_id)) / nparts,2)
}
save( nodejs.achievement, file='nodejs.achievement.rdata')
