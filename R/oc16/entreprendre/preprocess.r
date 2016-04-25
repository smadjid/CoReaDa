setwd("~/dev/CoReaDa/R/entreprendre")
options(stringsAsFactors=FALSE)
# Read the csv
library('Peirce')

selectedCourse='entreprendre'

setwd(paste('/home/madjid/dev/CoReaDa/R/',selectedCourse, sep='/'))
#http://codebeautify.org/jsonviewer#
load('entreprendre.rdata')
load('entreprendre.structure.rdata')



entreprendre[which(is.na(entreprendre$user_id)),]$user_id=0
entreprendre=entreprendre[which(!is.na(entreprendre$part_id)),]
entreprendre=unique(entreprendre)



part3count = nrow(entreprendre.structure[which(entreprendre.structure$type=='subchapter'),])
entreprendre.structure[which(entreprendre.structure$type!='subchapter'),]$part_index=0
entreprendre.structure[which(entreprendre.structure$type=='subchapter'),]$part_index=1:part3count
save(entreprendre.structure, file='entreprendre.structure.rdata')

parts=unique(entreprendre$part_id)
nparts=length(parts)

entreprendre=merge(entreprendre, entreprendre.structure[which(entreprendre.structure$type=='subchapter'),c('part_index','part_id')], by='part_id')
entreprendre=entreprendre[order(entreprendre$date),]  
rownames(entreprendre)=1:nrow(entreprendre)
entreprendre$id=1:nrow(entreprendre)
save(entreprendre,file='entreprendre.rdata')

entreprendre$end=entreprendre$date
entreprendre$duration=NA
users = unique(unique(entreprendre$user_id))
nusers=length(unique(entreprendre$user_id))
# End calculation
for (i in 1:nusers)
{
  time = subset(entreprendre, entreprendre$user_id==users[i], select=c(id,date))
  l = (length(time$id))-1
  if(l==0) next;
  time=time[order(time$date),]  
  j=1
  for(j in 1:l)
  {
    
    currentID =time$id[j] 
    nextID = time$id[j+1]
    entreprendre[which(entreprendre$id==currentID),]$end = entreprendre[which(entreprendre$id==nextID),]$date
    duration = as.numeric(difftime(entreprendre[which(entreprendre$id==currentID),]$end,entreprendre[which(entreprendre$id==currentID),]$date, units = "secs"))
    entreprendre[which(entreprendre$id==currentID),]$duration = duration
    print(paste(i,'- duree = ',duration) )
    
  }   
}

save(entreprendre,file='entreprendre.rdata')

#Calcul des durees maximales des parties: couvrant 90% des obsels sur la partie
entreprendre.structure$max.duration=NA
entreprendre.structure$mean.duration=NA
entreprendre.structure$median.duration=NA
entreprendre.structure$q1.duration=NA
entreprendre.structure$q3.duration=NA



# On exclut : durees nulles et -1
entreprendre_with_duration = entreprendre[which(entreprendre$duration>=10 & entreprendre$duration<2*3600),]#;c('part_id','duration')]
# On exclut les derniers de chaque session
#entreprendre_with_duration = entreprendre_with_duration[which(entreprendre_with_duration$end > entreprendre_with_duration$date),]
#entreprendre_with_duration = entreprendre_with_duration[which(entreprendre_with_duration$duration < 3*3600),]
#Premiere winsorization a 4 heures
parts=unique(entreprendre[["part_id"]])
nparts = length(parts)
for (i in 1:nparts)
{
  print(i)
  part_entreprendre = subset(entreprendre_with_duration, entreprendre_with_duration$part_id==parts[i])
  part_entreprendre=Peirce(part_entreprendre$duration);
  maxD = round(as.numeric(max(part_entreprendre)  ),2);
  
  entreprendre.structure[which(entreprendre.structure$part_id==parts[i]),]$max.duration=maxD
  entreprendre[which(entreprendre$part_id==parts[i] & ( entreprendre$duration>maxD)),]$duration = NA
  
  entreprendre.structure[which(entreprendre.structure$part_id==parts[i]),]$max.duration=round(as.numeric(quantile(part_entreprendre,9/10)  ),2)
  entreprendre.structure[which(entreprendre.structure$part_id==parts[i]),]$mean.duration=round(as.numeric(mean(part_entreprendre)  ),2)
  entreprendre.structure[which(entreprendre.structure$part_id==parts[i]),]$median.duration=round(as.numeric(median(part_entreprendre)  ),2)
  entreprendre.structure[which(entreprendre.structure$part_id==parts[i]),]$q1.duration=round(as.numeric(quantile(part_entreprendre,1/4)  ),2)
  entreprendre.structure[which(entreprendre.structure$part_id==parts[i]),]$q3.duration=round(as.numeric(quantile(part_entreprendre,3/4)  ),2)
  
}

#Aggregate for parents
parents = entreprendre.structure[which(entreprendre.structure$type=='chapter'),]
nparents = nrow(parents)
for(i in 1:nparents){
  children = entreprendre.structure[which(entreprendre.structure$parent_id==parents$part_id[i]),]
  entreprendre.structure[which(entreprendre.structure$part_id==parents$part_id[i]),]$max.duration = sum(children$max.duration)
  entreprendre.structure[which(entreprendre.structure$part_id==parents$part_id[i]),]$mean.duration = sum(children$mean.duration)
  entreprendre.structure[which(entreprendre.structure$part_id==parents$part_id[i]),]$median.duration = sum(children$median.duration)
  entreprendre.structure[which(entreprendre.structure$part_id==parents$part_id[i]),]$q1.duration = sum(children$q1.duration)
  entreprendre.structure[which(entreprendre.structure$part_id==parents$part_id[i]),]$q3.duration = sum(children$q3.duration)
}

parents = entreprendre.structure[which(entreprendre.structure$type=='partie'),]
nparents = nrow(parents)
for(i in 1:nparents){
  children = entreprendre.structure[which(entreprendre.structure$parent_id==parents$part_id[i]),]
  entreprendre.structure[which(entreprendre.structure$part_id==parents$part_id[i]),]$max.duration = sum(children$max.duration)
  entreprendre.structure[which(entreprendre.structure$part_id==parents$part_id[i]),]$mean.duration = sum(children$mean.duration)
  entreprendre.structure[which(entreprendre.structure$part_id==parents$part_id[i]),]$median.duration = sum(children$median.duration)
  entreprendre.structure[which(entreprendre.structure$part_id==parents$part_id[i]),]$q1.duration = sum(children$q1.duration)
  entreprendre.structure[which(entreprendre.structure$part_id==parents$part_id[i]),]$q3.duration = sum(children$q3.duration)
}
parents = entreprendre.structure[which(entreprendre.structure$type=='course'),]
nparents = nrow(parents)
for(i in 1:nparents){
  children = entreprendre.structure[which(entreprendre.structure$parent_id==parents$part_id[i]),]
  entreprendre.structure[which(entreprendre.structure$part_id==parents$part_id[i]),]$max.duration = sum(children$max.duration)
  entreprendre.structure[which(entreprendre.structure$part_id==parents$part_id[i]),]$mean.duration = sum(children$mean.duration)
  entreprendre.structure[which(entreprendre.structure$part_id==parents$part_id[i]),]$median.duration = sum(children$median.duration)
  entreprendre.structure[which(entreprendre.structure$part_id==parents$part_id[i]),]$q1.duration = sum(children$q1.duration)
  entreprendre.structure[which(entreprendre.structure$part_id==parents$part_id[i]),]$q3.duration = sum(children$q3.duration)
}

save(entreprendre.structure, file="entreprendre.structure.rdata") 

save(entreprendre, file="entreprendre.rdata")

# Seance calculation

#1. FOR ALL SESSIONS
entreprendre$seance = 1
users = unique(entreprendre$user_id)
users=sort(users)

for (i in 1:nusers)
{
  print(i)
  user = subset(entreprendre ,entreprendre$user_id==users[i],  select=c(id,part_id, date, end, duration, seance))
  
  user=user[order(user$date),]
  
  nums =1
  user$seance=nums
  entreprendre$seance[which(entreprendre$user_id==users[i])]=nums
  l=length(user$date)-1
  
  if(l==0) next
  for(j in 1:l)
  {
    
    tDiff = as.numeric(difftime(user$end[j],user$date[j], units = "secs"))
    maxD=entreprendre.structure$max.duration[which(entreprendre.structure$part_id==user$part_id[j])] 
    if(is.na(user$date[j+1])) next
    if(tDiff> maxD )    nums=nums+1
    else
    {
      sessionDiff = as.numeric(difftime(user$date[j+1],user$date[j], units = "secs"))
      if((tDiff==0)&&(sessionDiff>maxD))  nums=nums+1
      
    }
    user$seance[j+1]=nums
    entreprendre$seance[which(entreprendre$id==user$id[j+1])]=user$seance[j+1]
    
  }
  
}
save(entreprendre, file="entreprendre.rdata")


######################### RS STATS ##################################################""
entreprendre = entreprendre[which(entreprendre$user_id!=0),]
nusers=length(unique(entreprendre[["user_id"]]))
users = unique(entreprendre[["user_id"]])
users=sort(users)
unentreprendre = entreprendre[which(entreprendre$user_id==0),]
nsessions=length(unique(unentreprendre [["session_id"]]))
sessions = unique(unentreprendre [["session_id"]])
sessions=sort(sessions)
courseSize = sum(entreprendre.structure$size)

nRS=nrow(unique(subset(entreprendre, select=c("user_id","seance")))) + 
  nrow(unique(subset(unentreprendre, select=c("session_id","seance"))))
Users_RS = entreprendre.frame(id = 1:nRS, user = 0, nparts = 0, nuniqueparts=0,  duration = 0)

cpt = 0
for(i in 1:nusers)
{
  user=entreprendre[which(entreprendre$user_id==users[i]),]
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
  session=unentreprendre[which(unentreprendre$session_id==sessions[i]),]
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

save(Users_RS, file="entreprendre.Users_RS.rdata")

########################

### INTEREST
#nRS
entreprendre=entreprendre[order(entreprendre$date),]
allParts=entreprendre.structure$part_id
entreprendre.Interest = data.frame(part_id=allParts,  Actions_nb=0, Users_nb = 0,Sessions_nb=0, RS_nb = 0)
parts=unique(entreprendre$part_id)
for(i in 1:(length(parts)))
{
  print(i)
  dataPart = entreprendre[which(entreprendre$part_id==parts[i]),]
  
  entreprendre.Interest[which(entreprendre.Interest$part_id==parts[i]),]=c(part_id=parts[i],
                                                     Actions_nb=length(dataPart$id),
                                                     Users_nb = length(unique(dataPart$user_id)),
                                                     Sessions_nb=length(unique(dataPart$session_id)),                                              
                                                     RS_nb = nrow(unique(dataPart[,c("user_id","seance")])));

  
}

#Aggregate for chapters

chapters = entreprendre.structure[which(entreprendre.structure$type=='chapter'),]$part_id
nchapters = length(unique(chapters))
for(i in 1:nchapters){
  children = entreprendre.structure[which(entreprendre.structure$parent_id==chapters[i]),]$part_id
 
  dataPart = entreprendre[which(entreprendre$part_id %in%children),]
  
  entreprendre.Interest[which(entreprendre.Interest$part_id==chapters[i]),]=c(part_id=chapters[i],
                                                               Actions_nb=length(dataPart$id),
                                                               Users_nb = length(unique(dataPart$user_id)),
                                                               Sessions_nb=length(unique(dataPart$session_id)),                                              
                                                               RS_nb = nrow(unique(dataPart[,c("user_id","seance")])));
 
}

#Aggregate for tomes
tomes = entreprendre.structure[which(entreprendre.structure$type=='partie'),]$part_id
ntomes = length(unique(tomes))
for(i in 1:ntomes){
  children = entreprendre.structure[which(entreprendre.structure$parent_id==tomes[i]),]$part_id
  
  subchildren = entreprendre.structure[which(entreprendre.structure$parent_id%in%children),]$part_id
  
  
  dataPart = entreprendre[which(entreprendre$part_id %in%subchildren),]
  
  entreprendre.Interest[which(entreprendre.Interest$part_id==tomes[i]),]=c(part_id=tomes[i],
                                                                  Actions_nb=length(dataPart$id),
                                                                  Users_nb = length(unique(dataPart$user_id)),
                                                                  Sessions_nb=length(unique(dataPart$session_id)),                                              
                                                                  RS_nb = nrow(unique(dataPart[,c("user_id","seance")])));
  
}
#Aggregate for all course
courseId = entreprendre.structure[which(entreprendre.structure$type=='course'),]$part_id
entreprendre.Interest[which(entreprendre.Interest$part_id==courseId),]=c(part_id=courseId,
                                                             Actions_nb=length(entreprendre$id),
                                                             Users_nb = length(unique(entreprendre$user_id)),
                                                             Sessions_nb=length(unique(entreprendre$session_id)),                                              
                                                             RS_nb = nrow(unique(entreprendre[,c("user_id","seance")])));

entreprendre.Interest = merge(entreprendre.Interest, entreprendre.structure[,c('part_index','part_id','type')])
save(entreprendre.Interest, file="entreprendre.Interest.rdata")


########################"Coverage
nRS=nrow(unique(subset(entreprendre, select=c("user_id","seance"))))

RS = data.frame(id = 1:nRS,nparts = 0, duration = 0)

U=subset(entreprendre, select=c("user_id","seance","part_id"))
users = unique(U$user_id)
nusers = length(users)
cpt = 0
for(i in 1:nusers)
{
  print(i)
  user=entreprendre[which(entreprendre$user_id==users[i]),]
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
entreprendre.RS = RS
save(entreprendre.RS, file="entreprendre.RS.rdata")



################ READS #####################################################"

library('plyr')
### Nombre de lecteurs (RDer), de relecteurs (Rereaders), de lectures (RDing) et de relectures (RRDing)
entreprendre.Reads = data.frame(part_index=entreprendre.structure$part_index,part_id=entreprendre.structure$part_id,Actions_nb = 0, Readers=0,
                          Rereaders=0,Readings = 0, Rereadings = 0 )
parts=unique(entreprendre$part_id)
nparts=length(parts)
for(i in 1:(nparts))
{
  rders = count(entreprendre[which(entreprendre$part_id==parts[i]),], "user_id")
  
  entreprendre.Reads[which(entreprendre.Reads$part_id==parts[i]),]$Actions_nb =nrow(entreprendre[which(entreprendre$part_id==parts[i]),])
  
  entreprendre.Reads[which(entreprendre.Reads$part_id==parts[i]),]$Readers =    length(rders$user_id)
  
  entreprendre.Reads[which(entreprendre.Reads$part_id==parts[i]),]$Rereaders =  length(rders[which(rders$freq>1),]$user_id) 
  
  rdings = count(entreprendre[which(entreprendre$part_id==parts[i]),], "id")
  entreprendre.Reads[which(entreprendre.Reads$part_id==parts[i]),]$Readings =   sum(rders$freq)
  
  entreprendre.Reads[which(entreprendre.Reads$part_id==parts[i]),]$Rereadings = sum(rders$freq)  - length(rders$user_id)   
  
}

### Nombre de relecture successive des parties
users=unique(entreprendre$user_id)
nusers=length(users)
successive.rereads = data.frame(part_index=1:nparts, Sequential_rereadings = 0)
for (i in 1:nusers)
{
  user.seances = subset(entreprendre, entreprendre$user_id==users[i], select=c('seance','part_index','date'))
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
        print(n)
      }
    }
  }
}



entreprendre.Reads = merge(entreprendre.Reads,successive.rereads, by="part_index", all.x = TRUE)
 

###### RELECTURES DECALEES #########################


decaled.rereads = data.frame(part_index=1:nparts, Decaled_rereadings = 0)

for (i in 1:nusers)
{
  print(paste("USER: ",i))
  user.seances = subset(entreprendre, entreprendre$user_id==users[i], select=c(seance,part_index,date))
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
entreprendre.Reads = merge(entreprendre.Reads,decaled.rereads, by="part_index", all.x = TRUE)

entreprendre.Reads$Rereadings =  entreprendre.Reads$Decaled_rereadings +  entreprendre.Reads$Sequential_rereadings
# Aggregate for chapters
chapters = entreprendre.structure[which(entreprendre.structure$type=='chapter'),]$part_id
nchapters = length(unique(chapters))
for(i in 1:nchapters){
  children = entreprendre.structure[which(entreprendre.structure$parent_id==chapters[i]),]$part_id  
  entreprendre.Reads[which(entreprendre.Reads$part_id==chapters[i]),]$Readers = sum(entreprendre.Reads[which(entreprendre.Reads$part_id%in%children),]$Readers)
  entreprendre.Reads[which(entreprendre.Reads$part_id==chapters[i]),]$Actions_nb = sum(entreprendre.Reads[which(entreprendre.Reads$part_id%in%children),]$Actions_nb)
  entreprendre.Reads[which(entreprendre.Reads$part_id==chapters[i]),]$Rereaders =  mean(entreprendre.Reads[which(entreprendre.Reads$part_id%in%children),]$Rereaders)  
  entreprendre.Reads[which(entreprendre.Reads$part_id==chapters[i]),]$Readings =  mean(entreprendre.Reads[which(entreprendre.Reads$part_id%in%children),]$Readings)    
  entreprendre.Reads[which(entreprendre.Reads$part_id==chapters[i]),]$Rereadings = mean(entreprendre.Reads[which(entreprendre.Reads$part_id%in%children),]$Rereadings)  
  
}
# Aggregate for tomes
tomes = entreprendre.structure[which(entreprendre.structure$type=='partie'),]$part_id
ntomes = length(unique(tomes))
for(i in 1:ntomes){
  first_children = entreprendre.structure[which(entreprendre.structure$parent_id==tomes[i]),]$part_id
  children = entreprendre.structure[which(entreprendre.structure$parent_id%in%first_children),]$part_id
  
  
  entreprendre.Reads[which(entreprendre.Reads$part_id==tomes[i]),]$Readers =  sum(entreprendre.Reads[which(entreprendre.Reads$part_id%in%children),]$Readers)
  entreprendre.Reads[which(entreprendre.Reads$part_id==tomes[i]),]$Actions_nb = sum(entreprendre.Reads[which(entreprendre.Reads$part_id%in%children),]$Actions_nb)
  entreprendre.Reads[which(entreprendre.Reads$part_id==tomes[i]),]$Rereaders =  mean(entreprendre.Reads[which(entreprendre.Reads$part_id%in%children),]$Rereaders)  
  entreprendre.Reads[which(entreprendre.Reads$part_id==tomes[i]),]$Readings =  mean(entreprendre.Reads[which(entreprendre.Reads$part_id%in%children),]$Readings)    
  entreprendre.Reads[which(entreprendre.Reads$part_id==tomes[i]),]$Rereadings = mean(entreprendre.Reads[which(entreprendre.Reads$part_id%in%children),]$Rereadings)  
  
}
courseId  = entreprendre.structure[which(entreprendre.structure$type=='course'),]$part_id
entreprendre.Reads[which(entreprendre.Reads$part_id==courseId),]$Readers =    length(unique(entreprendre$user_id))

entreprendre.Reads$rereadings_tx = entreprendre.Reads$Rereadings / entreprendre.Reads$Readings

entreprendre.Reads$part_readers_rereaders = round(entreprendre.Reads$Rereaders / entreprendre.Reads$Readers, 4) 
entreprendre.Reads$course_readers_rereaders = round(entreprendre.Reads$Rereaders / nusers, 4) 
entreprendre.Reads$rereads_seq_tx = round(100 * entreprendre.Reads$Sequential_rereadings / entreprendre.Reads$Rereadings,0)
entreprendre.Reads$rereads_dec_tx = round(100 * entreprendre.Reads$Decaled_rereadings / entreprendre.Reads$Rereadings,0)
save(entreprendre.Reads, file="entreprendre.Reads.rdata")
##############################################"""
   
PartData$mean.tx_total_rereaders = round(100 * PartData$Rereaders / PartData$Readers, 2) 
PartData$mean.tx_total_readers = round(100 * PartData$Rereaders / nusers, 2) 
###### RUPTURE ##################"
entreprendre.Ruptures= data.frame(user_id=numeric(), seance=integer(),part_index=integer(), recovery=logical(),
                        direct_recovery=logical(),next_recovery=logical(), distant_next_recovery=logical(),
                        prev_recovery=logical(), distant_prev_recovery=logical())
                         
users=unique(entreprendre$user_id)
nusers=length(users)
for (i in 1:nusers)
{
  print(i)
  
  user = entreprendre[which(entreprendre$user_id==users[i]),]
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
    
    
    if(j==length(user.seances)){entreprendre.Ruptures=rbind(entreprendre.Ruptures,disconnection)}
    else{      
      nextseance=user[which(user$seance==j+1),]
      nextbegin = nextseance[which(nextseance$id==min(nextseance$id)),]$part_index
      if(nextbegin==end) { disconnection$direct_recovery=TRUE}
      if(nextbegin>end+1) { disconnection$distant_next_recovery=TRUE}
      if(nextbegin==end+1) { disconnection$next_recovery=TRUE}
      if(nextbegin==end - 1) { disconnection$prev_recovery=TRUE}
      if(nextbegin<end - 1) { disconnection$distant_prev_recovery=TRUE}
     
    }
    entreprendre.Ruptures=rbind(entreprendre.Ruptures,disconnection)    
    
  }
  
}

rupture_parts=unique(entreprendre.Ruptures$part_index)

norecovery_Ruptures=entreprendre.Ruptures[which((!entreprendre.Ruptures$direct_recovery)&
                                            (!entreprendre.Ruptures$distant_next_recovery)&
                                            (!entreprendre.Ruptures$next_recovery)&
                                            (!entreprendre.Ruptures$prev_recovery)&
                                            (!entreprendre.Ruptures$distant_prev_recovery)),]
entreprendre.Ruptures$norecovery = 0
for(i in 1:length(rupture_parts))
{
  rupt = rupture_parts[i]
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_index==rupt),]$norecovery = 
    nrow(norecovery_Ruptures[which(norecovery_Ruptures$part_index==rupt),])
}
recovery_Ruptures=entreprendre.Ruptures[which((entreprendre.Ruptures$direct_recovery)|
                        (entreprendre.Ruptures$distant_next_recovery)|
                        (entreprendre.Ruptures$next_recovery)|
                        (entreprendre.Ruptures$prev_recovery)|
                        (entreprendre.Ruptures$distant_prev_recovery)),]
entreprendre.Ruptures$recovery = 0
for(i in 1:length(rupture_parts))
{
  rupt = rupture_parts[i]
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_index==rupt),]$recovery = 
    nrow(recovery_Ruptures[which(recovery_Ruptures$part_index==rupt),])
} 
entreprendre.Ruptures$rupture = entreprendre.Ruptures$norecovery + entreprendre.Ruptures$recovery

RupStats =data.frame(part_index=rupture_parts,  rupture=0, recovery=0,  norecovery=0,direct_recovery=0,
                     distant_next_recovery=0, next_recovery=0, prev_recovery=0, distant_prev_recovery=0) 
for(k in 1:length(rupture_parts))
{
  i = rupture_parts[k]
  RupStats[which(RupStats$part_index==i),]$rupture= max(entreprendre.Ruptures[which(entreprendre.Ruptures$part_index==i),]$rupture)
  RupStats[which(RupStats$part_index==i),]$recovery= max(entreprendre.Ruptures[which(entreprendre.Ruptures$part_index==i),]$recovery)
  RupStats[which(RupStats$part_index==i),]$norecovery= max(entreprendre.Ruptures[which(entreprendre.Ruptures$part_index==i),]$norecovery)
  RupStats[which(RupStats$part_index==i),]$distant_next_recovery= nrow(entreprendre.Ruptures[which(entreprendre.Ruptures$part_index==i & entreprendre.Ruptures$distant_next_recovery),])
  RupStats[which(RupStats$part_index==i),]$next_recovery= nrow(entreprendre.Ruptures[which(entreprendre.Ruptures$part_index==i & entreprendre.Ruptures$next_recovery),])
  RupStats[which(RupStats$part_index==i),]$prev_recovery= nrow(entreprendre.Ruptures[which(entreprendre.Ruptures$part_index==i & entreprendre.Ruptures$prev_recovery),])
  RupStats[which(RupStats$part_index==i),]$distant_prev_recovery= nrow(entreprendre.Ruptures[which(entreprendre.Ruptures$part_index==i & entreprendre.Ruptures$distant_prev_recovery),])
  RupStats[which(RupStats$part_index==i),]$direct_recovery= nrow(entreprendre.Ruptures[which(entreprendre.Ruptures$part_index==i & entreprendre.Ruptures$direct_recovery),])
}

entreprendre.Ruptures = merge(entreprendre.structure[,c('part_index','part_id')],RupStats, all.x = TRUE )
# Aggregates

parents = entreprendre.structure[which(entreprendre.structure$type=='chapter'),]
nparents = nrow(parents)
for(i in 1:nparents){
  children = entreprendre.structure[which(entreprendre.structure$parent_id==parents$part_id[i]),]$part_id
  
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$rupture = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$rupture)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$norecovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$recovery)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$recovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$norecovery)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$distant_next_recovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$distant_next_recovery)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$next_recovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$next_recovery)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$prev_recovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$prev_recovery)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$distant_prev_recovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$distant_prev_recovery)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$direct_recovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$direct_recovery)
}

parents = entreprendre.structure[which(entreprendre.structure$type=='partie'),]
nparents = nrow(parents)
for(i in 1:nparents){
  children = entreprendre.structure[which(entreprendre.structure$parent_id==parents$part_id[i]),]$part_id
  
  
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$rupture = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$rupture)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$norecovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$recovery)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$recovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$norecovery)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$distant_next_recovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$distant_next_recovery)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$next_recovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$next_recovery)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$prev_recovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$prev_recovery)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$distant_prev_recovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$distant_prev_recovery)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$direct_recovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$direct_recovery)
}
parents = entreprendre.structure[which(entreprendre.structure$type=='course'),]
nparents = nrow(parents)
for(i in 1:nparents){
  children = entreprendre.structure[which(entreprendre.structure$parent_id==parents$part_id[i]),]$part_id
  
  
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$rupture = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$rupture)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$norecovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$recovery)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$recovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$norecovery)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$distant_next_recovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$distant_next_recovery)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$next_recovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$next_recovery)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$prev_recovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$prev_recovery)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$distant_prev_recovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$distant_prev_recovery)
  entreprendre.Ruptures[which(entreprendre.Ruptures$part_id==parents$part_id[i]),]$direct_recovery = 
    sum( entreprendre.Ruptures[which(entreprendre.Ruptures$part_id%in%children),]$direct_recovery)
}

save(entreprendre.Ruptures,file="entreprendre.Ruptures.rdata")


######################Parts Follow ######################
parts=unique(entreprendre$part_id)
nparts=length(parts)
entreprendre.partFollow = matrix(nrow = nparts, ncol = nparts, data=0)
parPreceed = matrix(nrow = nparts, ncol = nparts, data=0)
for (u in 1:nusers)
{
  print(u)
  userData = subset(entreprendre, entreprendre$user_id==users[u], select=c(id,part_index))  
  userData=userData[order(userData$id),]
  for(i in 1:nrow(userData)-1)
  {
    entreprendre.partFollow[userData[i,]$part_index, userData[i+1,]$part_index] =
      entreprendre.partFollow[userData[i,]$part_index, userData[i+1,]$part_index] + 1
    
    parPreceed[userData[i+1,]$part_index, userData[i,]$part_index] =
      parPreceed[userData[i+1,]$part_index, userData[i,]$part_index] + 1  
  }
}

save(entreprendre.partFollow, file="entreprendre.partFollow.rdata")

######## Parents Follow
structure=entreprendre.structure
chaps=data.frame(parent_id= unique(structure[which(structure$type=='chapter'),]$part_id))
chaps$chap_index=1:nrow(chaps)
chaps$tome_index=0


tomes = data.frame(tome_id= unique(structure[which(structure$type=='partie'),]$part_id))
tomes$tome_index=1:nrow(tomes)

for(i in 1:nrow(chaps)){
  chap =   chaps[which(chaps$chap_index==i),]$parent_id
  parent = structure[which(structure$part_id==chap),]$parent_id
  parent_index = tomes[which(tomes$tome_id==parent),]$tome_index
  chaps[which(chaps$chap_index==i),]$tome_index=parent_index
}

entreprendre.structure = merge(entreprendre.structure, chaps, all.x = TRUE)
entreprendre = merge(entreprendre, entreprendre.structure[,c('part_id','chap_index','tome_index')] , all.x = TRUE)

save(entreprendre, file='entreprendre.rdata')

save(entreprendre.structure, file='entreprendre.structure.rdata')

#ChapFollow
users = unique(entreprendre$user_id)
nusers = length(users)

nchaps=nrow(chaps)
entreprendre.chapFollow = matrix(nrow = nchaps, ncol = nchaps, data=0)

for (u in 1:nusers)
{
  print(u)
  userData = subset(entreprendre, entreprendre$user_id==users[u], select=c(id,chap_index))  
  userData=userData[order(userData$id),]
  userData = userData$chap_index
  
  for(i in 1:length(userData)-1)
  {
    entreprendre.chapFollow[userData[i], userData[i+1]] =
      entreprendre.chapFollow[userData[i], userData[i+1]]  + 1
  }
}
save(entreprendre.chapFollow, file='entreprendre.chapFollow.rdata')
#TomeFollow
users = unique(entreprendre$user_id)
nusers = length(users)
tomes=unique(chaps$tome_index)
ntomes=length(tomes)
entreprendre.tomeFollow = matrix(nrow = ntomes, ncol = ntomes, data=0)

for (u in 1:nusers)
{
  print(u)
  userData = subset(entreprendre, entreprendre$user_id==users[u], select=c(id,tome_index))  
  userData=userData[order(userData$id),]
  userData = userData$tome_index
  
  for(i in 1:length(userData)-1)
  {
    entreprendre.tomeFollow[userData[i], userData[i+1]] =
      entreprendre.tomeFollow[userData[i], userData[i+1]]  + 1
  }
}
save(entreprendre.tomeFollow, file='entreprendre.tomeFollow.rdata')

### Taux avancement ###########
#s =  structure[structure$type=='subchapter',c('part_id','title')]
#achievData = merge(entreprendre, s, by='part_id')

nparts = length(unique(entreprendre$part_id))
entreprendre.achievement =data.frame(user_id=users,taux=0)
for(i in 1:nusers){
  entreprendre.achievement[which(entreprendre.achievement$user_id==users[i]),]$taux = round(length(unique(entreprendre[which(entreprendre$user_id==users[i]),]$part_id)) / nparts,2)
}
save( entreprendre.achievement, file='entreprendre.achievement.rdata')
