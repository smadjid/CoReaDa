
main <- function (jsonObj) {
options(stringsAsFactors=FALSE)
#options(warn=-1)
library('jsonlite')
library('reshape2')
library('Peirce')
library('plyr')
#library('data.table')

BaseURL = ('/home/madjid/Dropbox/rcoreada')
#BaseURL="C:/Users/MADJID/Desktop/rcoreada"
coreaDataURL = "/home/madjid/dev/CoReaDa/coursesdata"
home='/home/madjid/Dropbox/rcoreada/Dataset'
coursesdata_home='/home/madjid/dev/CoReaDa/rawdata'

DataBaseURL = paste(BaseURL,'R', sep='/')
 #o = fromJSON(jsonObj)
 #o$a

 range01 <- function(x, ...){(x - min(x, ...)) / (max(x, ...) - min(x, ...))}
 consistency.constant <- 1.4826
 
 DoubleMAD <- function(x, zero.mad.action="warn"){
   # The zero.mad.action determines the action in the event of an MAD of zero.
   # Possible values: "stop", "warn", "na" and "warn and na".
   x         <- x[!is.na(x)]
   m         <- median(x)
   abs.dev   <- abs(x - m)
   left.mad  <- median(abs.dev[x<=m])
   right.mad <- median(abs.dev[x>=m])
   if (left.mad == 0 || right.mad == 0){
     if (zero.mad.action == "stop") stop("MAD is 0")
     if (zero.mad.action %in% c("warn", "warn and na")) warning("MAD is 0")
     if (zero.mad.action %in% c(  "na", "warn and na")){
       if (left.mad  == 0) left.mad  <- NA
       if (right.mad == 0) right.mad <- NA
     }
   }
   return(c(left.mad, right.mad))
 }
 
 DoubleMADsFromMedian <- function(x, zero.mad.action="warn"){
   # The zero.mad.action determines the action in the event of an MAD of zero.
   # Possible values: "stop", "warn", "na" and "warn and na".
   two.sided.mad <- DoubleMAD(x, zero.mad.action)
   m <- median(x, na.rm=TRUE)
   x.mad <- rep(two.sided.mad[1], length(x))
   x.mad[x > m] <- two.sided.mad[2]
   mad.distance <- abs(x - m) / x.mad
   mad.distance[x==m] <- 0
   return(mad.distance)
 }
 outliersMAD <- function(data, MADCutOff = 2.5, replace = NA, values = FALSE, bConstant = 1.4826, digits = 2) {
   #compute number of absolute MADs away for each value
   #formula: abs( ( x - median(x) ) )/ mad(x)
   absMADAway <- abs((data - median(data, na.rm = T))/mad(data, constant = bConstant, na.rm = T))
   #subset data that has absMADAway greater than the MADCutOff and replace them with replace
   #can also replace values other than replace
   data[absMADAway > MADCutOff] <- replace
   
   if (values == TRUE) { 
     return(round(absMADAway, digits)) #if values == TRUE, return number of mads for each value
   } else {
     return(round(data, digits)) #otherwise, return values with outliers replaced
   }
 }
 
 

###################################################### FUNCTIONS DECLARATION
tmp<- function(){
home="/home/madjid/Dropbox/rcoreada/Dataset"
allF = list.dirs(home)
for(i in 2: length(allF)){
print(paste(i-1,length(allF)-1,sep=' / ')) 

do_course(paste(allF[i],'data.csv',sep='/'),paste(allF[i],'structure.json',sep='/'))

}

}
###############  MAIN CALL FUNCTION 

#csv_f = "/home/madjid/Dropbox/rcoreada/Dataset/1946386/data.csv"
#json_f = "/home/madjid/Dropbox/rcoreada/Dataset/1946386/structure.json"
#do_course(csv_f,json_f)

do_course <- function(csv_f,json_f){
data = extract_course(csv_f)
#print('DATA OK')
structure = extract_structure(json_f)
structure$size = 0
structure$nb_img = 0
structure$vid_length = 0
#print('STRUCTURE OK')

#data = head(data, n=800)
courseId = unique(data$course_id)
setwd(coursesdata_home)
dir.create(file.path(coursesdata_home, courseId), showWarnings = FALSE)
setwd(paste(coursesdata_home,courseId,sep='/'))
save(data,file='data.rdata')
save(structure,file='structure.rdata')

do_fct = preprocess(data,structure)
data = do_fct$data
structure = do_fct$structure

do_fct = sessionization(data,structure)
data = do_fct$data
structure = do_fct$structure

indicators = indicators_calculation(data,structure)
data = indicators$data
structure = indicators$structure
RS = indicators$RS
Interest = indicators$Interest
Reads = indicators$Reads
Ruptures = indicators$Ruptures
partFollow = indicators$partFollow
save(RS, file="RS.rdata")
save(Interest, file="Interest.rdata")
save(Reads, file="Reads.rdata")
save(Ruptures,file="Ruptures.rdata")
save(partFollow, file="partFollow.rdata")

dir.create(file.path(coreaDataURL,courseId), showWarnings = FALSE)
courseDataURL=paste(coreaDataURL,courseId,sep='/')
CourseDataCalc = course_data_calculation(data,structure, indicators)

CourseData=CourseDataCalc$CourseData
PartData = CourseDataCalc$PartData
TransitionsData =  CourseDataCalc$TransitionsData



meltParts=melt(PartData, id.vars = 'id')
  meltedCourseStats = melt(CourseData,  id.vars ="id")  
  meltedCourseData = rbind(meltParts,meltedCourseStats)
  if(nrow(meltedCourseData[is.nan(meltedCourseData$value),])>0) meltedCourseData[is.nan(meltedCourseData$value),]$value=0
  if(nrow(meltedCourseData[is.na(meltedCourseData$value),])>0) meltedCourseData[is.na(meltedCourseData$value),]$value=0
  
CourseData.json = toJSON(meltedCourseData) 
cat(CourseData.json, file=paste(courseDataURL,"data.json",sep='/'))

TransitionsData.json = toJSON(TransitionsData)
cat(TransitionsData.json, file=paste(courseDataURL,"navigation.json",sep='/'))

facts = course_issues_calculation(data, structure,PartData)
facts.json = toJSON(facts)
save(facts, file="facts.rdata")
cat(facts.json, file=paste(courseDataURL,"facts.json",sep='/'))
print('COREADA')
}
###############  CSV + Structure ###########################


extract_course <- function(csv_f){
data = read.csv2(csv_f)
nothing = min(as.character(data$session_id))
data=data[which(data$session_id!=nothing),]

data = data[which(!is.na(data$part_id)),]
data=unique(data)
data$date = as.POSIXct(data$date)
data=data[order(data$date),]  
rownames(data)=1:nrow(data)
data$id=1:nrow(data)
data=data[,c("id" ,"course_id" , "part_id"  ,"user_id",  "session_id" ,"date")]
return(data)
}

extract_structure <- function(path){
jsonstructure <- fromJSON(path)
courseId = jsonstructure$id

id_counter = 0;
structure = data.frame(id=id_counter, part_id=jsonstructure$id, parent_id=0,title=jsonstructure$title,type=jsonstructure$subtype,
                       slug=jsonstructure$slug, element_id=jsonstructure$elementId, course_id= courseId)

ntomes = nrow(jsonstructure$children)
if(ntomes>0)
for(t_counter in 1:ntomes){
 
  itome = as.data.frame(jsonstructure$children[t_counter,])
  tome.structure = data.frame(id=-99, part_id=itome$id, parent_id=structure[1,'part_id'],title=itome$title, type=itome$subtype,
                              slug=itome$slug, element_id=itome$elementId,course_id= courseId)
  structure = rbind(structure , tome.structure)
  
  chaps= as.data.frame(itome$children)
    nchaps =  nrow(chaps)
  if(nchaps>0)
  for(ch_counter in 1:nchaps){
    id_counter = id_counter + 1
    ichap =  as.data.frame(chaps[ch_counter,])
    chap.structure = data.frame(id=id_counter, part_id=ichap$id, parent_id=itome$id,title=ichap$title,type=ichap$subtype,
                                slug=ichap$slug, element_id=ichap$elementId,course_id= courseId)
    structure = rbind(structure , chap.structure)
    
    parts =  as.data.frame(ichap$children)
    npart = nrow(parts)
    
    if(npart>0)
    for(part_counter in 1:npart ){
      id_counter = id_counter + 1
      ipart =  as.data.frame(ichap$children)[part_counter,]
      part.structure = data.frame(id = id_counter, part_id=ipart$id, parent_id=ichap$id,title=ipart$title,type=ipart$subtype,
                                  slug='', element_id=ipart$elementId,course_id= courseId)
      structure = rbind(structure , part.structure)
    }
  }
  
}

return(structure)

}


###############  PREPROCESS COURSE ###########################
preprocess <- function(data, structure){
  names(structure)[1] = 'part_index'
  structure$obsels=0
  part3count = nrow(structure[which(structure$type=='title-2'),])
  structure[which(structure$type!='title-2'),]$part_index=0
  structure[which(structure$type=='title-2'),]$part_index=1:part3count
  
  
  parts=unique(data$part_id)
  nparts=length(parts)
  #for(i in 1:nparts)
  #  structure[which(structure$part_id==parts[i]),]$obsels=nrow(data[which(data$part_id == parts[i]),])
  if(!("part_index" %in% colnames(data)))
  {
    data=merge(data, structure[which(structure$type=='title-2'),c('part_index','part_id')], by='part_id')
  }
  
  data=data[order(data$date),]  
  data$id=1:nrow(data) 
  res = list(data=data,structure = structure)
  return(res)
  
}

###############  RS COMPUTATION 
sessionization <- function(data,structure){
  parts=unique(data$part_id)
  nparts=length(parts)
  
  data$end=data$date
  data$duration=-1
  users = unique(unique(data$user_id))
  nusers=length(unique(data$user_id))
  # End calculation
 print('End calculation')
  for (i in 1:nusers)
  {
    time = subset(data, data$user_id==users[i], select=c(id,date))
    l = (length(time$id))-1
    if(l==0) next;
    time=time[order(time$date),]  
    j=1
    for(j in 1:l)
    {
      
      duration =  as.numeric(difftime(time$date[j+1],time$date[j], units = "secs"))
      data[which(data$id==time$id[j]),c('end','duration')]=list(time$date[j+1],duration)
      
     print(paste(i,'/',nusers))
      
    }   
  }
  
  # Durations
 print('Durations')
  
  structure$max.duration=NA
  structure$mean.duration=NA
  structure$median.duration=NA
  structure$q1.duration=NA
  structure$q3.duration=NA
  
  
  
  # On exclut : durees nulles et -1
  data_with_duration = data[which(data$duration>=10 & data$duration<2*3600),]#;c('part_id','duration')]
  # On exclut les derniers de chaque session
  #data_with_duration = data_with_duration[which(data_with_duration$end > data_with_duration$date),]
  #data_with_duration = data_with_duration[which(data_with_duration$duration < 3*3600),]
  #Premiere winsorization a 4 heures
  parts=unique(data[["part_id"]])
  nparts = length(parts)
  for (i in 1:nparts)
  {
   print(i)
    part_data = subset(data_with_duration, data_with_duration$part_id==parts[i])
    part_data=Peirce(part_data$duration);
    maxD = round(as.numeric(max(part_data)  ),2);
    
    structure[which(structure$part_id==parts[i]),]$max.duration=maxD
    data[which(data$part_id==parts[i] & ( data$duration==-1)),]$duration = maxD
    
    
    structure[which(structure$part_id==parts[i]),]$max.duration=round(as.numeric(quantile(part_data,9/10)  ),2)
    structure[which(structure$part_id==parts[i]),]$mean.duration=round(as.numeric(mean(part_data)  ),2)
    structure[which(structure$part_id==parts[i]),]$median.duration=round(as.numeric(median(part_data)  ),2)
    structure[which(structure$part_id==parts[i]),]$q1.duration=round(as.numeric(quantile(part_data,1/4)  ),2)
    structure[which(structure$part_id==parts[i]),]$q3.duration=round(as.numeric(quantile(part_data,3/4)  ),2)
    
    
  }
  
  # Seance calculation
 print('Seance calculation')
  data$seance = 1
  users = unique(data$user_id)
  users=sort(users)
  
  for (i in 1:nusers)
  {
   print(i)
    user = subset(data ,data$user_id==users[i],  select=c(id,part_id, date, end, duration, seance))
    
    user=user[order(user$date),]
    
    nums =1
    user$seance=nums
    data$seance[which(data$user_id==users[i])]=nums
    l=length(user$date)-1
    
    if(l==0) next
    for(j in 1:l)
    {
      
      tDiff = as.numeric(difftime(user$end[j],user$date[j], units = "secs"))
      maxD=structure$max.duration[which(structure$part_id==user$part_id[j])] 
      if(is.na(user$date[j+1])) next
      if(tDiff> maxD )    nums=nums+1
      else
      {
        sessionDiff = as.numeric(difftime(user$date[j+1],user$date[j], units = "secs"))
        if((tDiff==0)&&(sessionDiff>maxD))  nums=nums+1
        
      }
      user$seance[j+1]=nums
      data$seance[which(data$id==user$id[j+1])]=user$seance[j+1]
      
    }
    
  }
  
  res = list(data=data,structure = structure)
  return(res)
    
}

###############  INDICATORS
indicators_calculation <- function(data,structure){
  
  data = data[which(data$user_id!=0),]
  nusers=length(unique(data[["user_id"]]))
  users = unique(data[["user_id"]])
  users=sort(users)
  ############ RS 
 print('RS ')
  
  nRS=nrow(unique(subset(data, select=c("user_id","seance"))))
  
  RS = data.frame(id = 1:nRS,nparts = 0, duration = 0)
  U=subset(data, select=c("user_id","seance","part_id"))
  users = unique(U$user_id)
  nusers = length(users)
  cpt = 0
  for(i in 1:nusers)
  {
    
    user=data[which(data$user_id==users[i]),]
    seances = unique(user$seance)
    for(j in 1:length(seances))
    {
      seance = user[which(user$seance==seances[j]),]
      cpt = cpt +1
      
      RS[which(RS$id==cpt),]$nparts = length(unique(seance$part_id))
      
      RS[which(RS$id==cpt),]$duration = sum(seance$duration, na.rm = TRUE)
    }
  }
  RS = RS[which(RS$duration>60),]
  
  
  ################ INTEREST #####################################################"
 print('INTEREST')
  
  data=data[order(data$date),]
  allParts=structure$part_id
  Interest = data.frame(part_id=allParts,  Actions_nb=0, Users_nb = 0,Sessions_nb=0, RS_nb = 0)
  parts=unique(data$part_id)
  for(i in 1:(length(parts)))
  {
    
    dataPart = data[which(data$part_id==parts[i]),]
    
    Interest[which(Interest$part_id==parts[i]),]=c(part_id=parts[i],
                                                   Actions_nb=length(dataPart$id),
                                                   Users_nb = length(unique(dataPart$user_id)),
                                                   Sessions_nb=length(unique(dataPart$session_id)),                                              
                                                   RS_nb = nrow(unique(dataPart[,c("user_id","seance")])));
    
    
  }
  
  
  #Aggregate for tomes
  tomes = structure[which(structure$type=='title-1'),]$part_id
  ntomes = length(unique(tomes))
  for(i in 1:ntomes){
    children = structure[which(structure$parent_id==tomes[i]),]$part_id
    
    subchildren = structure[which(structure$parent_id%in%children),]$part_id
    
    
    dataPart = data[which(data$part_id %in%subchildren),]
    
    Interest[which(Interest$part_id==tomes[i]),]=c(part_id=tomes[i],
                                                   Actions_nb=length(dataPart$id),
                                                   Users_nb = length(unique(dataPart$user_id)),
                                                   Sessions_nb=length(unique(dataPart$session_id)),                                              
                                                   RS_nb = nrow(unique(dataPart[,c("user_id","seance")])));
    
  }
  #Aggregate for all course
  courseId = structure[which(structure$type=='course'),]$part_id
  Interest[which(Interest$part_id==courseId),]=c(part_id=courseId,
                                                 Actions_nb=length(data$id),
                                                 Users_nb = length(unique(data$user_id)),
                                                 Sessions_nb=length(unique(data$session_id)),                                              
                                                 RS_nb = nrow(unique(data[,c("user_id","seance")])));
  
  Interest = merge(Interest, structure[,c('part_index','part_id','type')])
  
  
  ################ READS #####################################################"
  
  ### Nombre de lecteurs (RDer), de relecteurs (Rereaders), de lectures (RDing) et de relectures (RRDing)
  Reads = data.frame(part_index=structure$part_index,part_id=structure$part_id,Actions_nb = 0, Readers=0,
                     Rereaders=0,Readings = 0, Rereadings = 0 )
  parts=unique(data$part_id)
  nparts=length(parts)
  for(i in 1:(nparts))
  {
    partdata = data[which(data$part_id==parts[i]),]
    rders = count(partdata, "user_id")  
    
    Reads[which(Reads$part_id==parts[i]),]$Actions_nb =nrow(data[which(data$part_id==parts[i]),])
    
    Reads[which(Reads$part_id==parts[i]),]$Readers =    length(rders$user_id)
    
    Reads[which(Reads$part_id==parts[i]),]$Rereaders =  length(rders[which(rders$freq>1),]$user_id) 
    
    
    Reads[which(Reads$part_id==parts[i]),]$Readings =   sum(rders$freq)
    
    
    rdings = count(partdata, c("part_id","user_id"))
    rdings$freq = rdings$freq - 1
    
    Reads[which(Reads$part_id==parts[i]),]$Rereadings = sum(rders$freq)  - length(rders$user_id)
  }
  
  ### Nombre de relecture successive des parties
  users=unique(data$user_id)
  nusers=length(users)
  successive.rereads = data.frame(part_index=1:nparts, Sequential_rereadings = 0)
  for (i in 1:nusers)
  {
    
    user.seances = subset(data, data$user_id==users[i], select=c('seance','part_index','date'))
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
  
  
  
  Reads = merge(Reads,successive.rereads, by="part_index", all.x = TRUE)
  
  
  ###### RELECTURES DECALEES #########################
  
  decaled.rereads = data.frame(part_index=1:nparts, Decaled_rereadings = 0)
  
  for (i in 1:nusers)
  {
   print(paste("USER: ",i,'/', nusers))
    user.seances = subset(data, data$user_id==users[i], select=c(seance,part_index,date))
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
  
  Reads = merge(Reads,decaled.rereads, by="part_index", all.x = TRUE)
  
  Reads$Rereadings =  Reads$Decaled_rereadings +  Reads$Sequential_rereadings
  
  # Aggregate for tomes
  tomes = structure[which(structure$type=='title-1'),]$part_id
  ntomes = length(unique(tomes))
  for(i in 1:ntomes){
    first_children = structure[which(structure$parent_id==tomes[i]),]$part_id
    children = structure[which(structure$parent_id%in%first_children),]$part_id
    
    
    Reads[which(Reads$part_id==tomes[i]),]$Readers =  sum(Reads[which(Reads$part_id%in%children),]$Readers)
    Reads[which(Reads$part_id==tomes[i]),]$Actions_nb = sum(Reads[which(Reads$part_id%in%children),]$Actions_nb)
    Reads[which(Reads$part_id==tomes[i]),]$Rereaders =  mean(Reads[which(Reads$part_id%in%children),]$Rereaders)  
    Reads[which(Reads$part_id==tomes[i]),]$Readings =  mean(Reads[which(Reads$part_id%in%children),]$Readings)    
    Reads[which(Reads$part_id==tomes[i]),]$Rereadings = mean(Reads[which(Reads$part_id%in%children),]$Rereadings)  
    
  }
  courseId  = structure[which(structure$type=='course'),]$part_id
  Reads[which(Reads$part_id==courseId),]$Readers =    length(unique(data$user_id))
  
  
  ###### RUPTURE #################
 print('Ruptures ')
  Ruptures= data.frame(user_id=numeric(), seance=integer(),part_index=integer(), recovery=logical(),
                       direct_recovery=logical(),next_recovery=logical(), distant_next_recovery=logical(),
                       prev_recovery=logical(), distant_prev_recovery=logical())
  
  users=unique(data$user_id)
  nusers=length(users)
  for (i in 1:nusers)
  {
   print(paste("USER: ",i,'/', nusers))
    
    user = data[which(data$user_id==users[i]),]
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
      
      
      if(j==length(user.seances)){Ruptures=rbind(Ruptures,disconnection)}
      else{      
        nextseance=user[which(user$seance==j+1),]
        nextbegin = nextseance[which(nextseance$id==min(nextseance$id)),]$part_index
        if(nextbegin==end) { disconnection$direct_recovery=TRUE}
        if(nextbegin>end+1) { disconnection$distant_next_recovery=TRUE}
        if(nextbegin==end+1) { disconnection$next_recovery=TRUE}
        if(nextbegin==end - 1) { disconnection$prev_recovery=TRUE}
        if(nextbegin<end - 1) { disconnection$distant_prev_recovery=TRUE}
        
      }
      Ruptures=rbind(Ruptures,disconnection)    
      
    }
    
  }
  
  rupture_parts=unique(Ruptures$part_index)
  
  norecovery_Ruptures=Ruptures[which((!Ruptures$direct_recovery)&
                                       (!Ruptures$distant_next_recovery)&
                                       (!Ruptures$next_recovery)&
                                       (!Ruptures$prev_recovery)&
                                       (!Ruptures$distant_prev_recovery)),]
  Ruptures$norecovery = 0
  for(i in 1:length(rupture_parts))
  {
    rupt = rupture_parts[i]
    Ruptures[which(Ruptures$part_index==rupt),]$norecovery = 
      nrow(norecovery_Ruptures[which(norecovery_Ruptures$part_index==rupt),])
  }
  recovery_Ruptures=Ruptures[which((Ruptures$direct_recovery)|
                                     (Ruptures$distant_next_recovery)|
                                     (Ruptures$next_recovery)|
                                     (Ruptures$prev_recovery)|
                                     (Ruptures$distant_prev_recovery)),]
  Ruptures$recovery = 0
  for(i in 1:length(rupture_parts))
  {
    rupt = rupture_parts[i]
    Ruptures[which(Ruptures$part_index==rupt),]$recovery = 
      nrow(recovery_Ruptures[which(recovery_Ruptures$part_index==rupt),])
  } 
  Ruptures$rupture = Ruptures$norecovery + Ruptures$recovery
  
  RupStats =data.frame(part_index=rupture_parts,  rupture=0, recovery=0,  norecovery=0,direct_recovery=0,
                       distant_next_recovery=0, next_recovery=0, prev_recovery=0, distant_prev_recovery=0) 
  for(k in 1:length(rupture_parts))
  {
    i = rupture_parts[k]
    RupStats[which(RupStats$part_index==i),]$rupture= max(Ruptures[which(Ruptures$part_index==i),]$rupture)
    RupStats[which(RupStats$part_index==i),]$recovery= max(Ruptures[which(Ruptures$part_index==i),]$recovery)
    RupStats[which(RupStats$part_index==i),]$norecovery= max(Ruptures[which(Ruptures$part_index==i),]$norecovery)
    RupStats[which(RupStats$part_index==i),]$distant_next_recovery= nrow(Ruptures[which(Ruptures$part_index==i & Ruptures$distant_next_recovery),])
    RupStats[which(RupStats$part_index==i),]$next_recovery= nrow(Ruptures[which(Ruptures$part_index==i & Ruptures$next_recovery),])
    RupStats[which(RupStats$part_index==i),]$prev_recovery= nrow(Ruptures[which(Ruptures$part_index==i & Ruptures$prev_recovery),])
    RupStats[which(RupStats$part_index==i),]$distant_prev_recovery= nrow(Ruptures[which(Ruptures$part_index==i & Ruptures$distant_prev_recovery),])
    RupStats[which(RupStats$part_index==i),]$direct_recovery= nrow(Ruptures[which(Ruptures$part_index==i & Ruptures$direct_recovery),])
  }
  
  Ruptures = merge(structure[,c('part_index','part_id')],RupStats, all.x = TRUE )
  
  # Aggregates
  
  parents = structure[which(structure$type=='title-1'),]
  nparents = nrow(parents)
  for(i in 1:nparents){
    children = structure[which(structure$parent_id==parents$part_id[i]),]$part_id
    
    
    Ruptures[which(Ruptures$part_id==parents$part_id[i]),]$rupture = 
      sum( Ruptures[which(Ruptures$part_id%in%children),]$rupture)
    Ruptures[which(Ruptures$part_id==parents$part_id[i]),]$norecovery = 
      sum( Ruptures[which(Ruptures$part_id%in%children),]$recovery)
    Ruptures[which(Ruptures$part_id==parents$part_id[i]),]$recovery = 
      sum( Ruptures[which(Ruptures$part_id%in%children),]$norecovery)
    Ruptures[which(Ruptures$part_id==parents$part_id[i]),]$distant_next_recovery = 
      sum( Ruptures[which(Ruptures$part_id%in%children),]$distant_next_recovery)
    Ruptures[which(Ruptures$part_id==parents$part_id[i]),]$next_recovery = 
      sum( Ruptures[which(Ruptures$part_id%in%children),]$next_recovery)
    Ruptures[which(Ruptures$part_id==parents$part_id[i]),]$prev_recovery = 
      sum( Ruptures[which(Ruptures$part_id%in%children),]$prev_recovery)
    Ruptures[which(Ruptures$part_id==parents$part_id[i]),]$distant_prev_recovery = 
      sum( Ruptures[which(Ruptures$part_id%in%children),]$distant_prev_recovery)
    Ruptures[which(Ruptures$part_id==parents$part_id[i]),]$direct_recovery = 
      sum( Ruptures[which(Ruptures$part_id%in%children),]$direct_recovery)
  }
  parents = structure[which(structure$type=='course'),]
  nparents = nrow(parents)
  for(i in 1:nparents){
    children = structure[which(structure$parent_id==parents$part_id[i]),]$part_id
    
    
    Ruptures[which(Ruptures$part_id==parents$part_id[i]),]$rupture = 
      sum( Ruptures[which(Ruptures$part_id%in%children),]$rupture)
    Ruptures[which(Ruptures$part_id==parents$part_id[i]),]$norecovery = 
      sum( Ruptures[which(Ruptures$part_id%in%children),]$recovery)
    Ruptures[which(Ruptures$part_id==parents$part_id[i]),]$recovery = 
      sum( Ruptures[which(Ruptures$part_id%in%children),]$norecovery)
    Ruptures[which(Ruptures$part_id==parents$part_id[i]),]$distant_next_recovery = 
      sum( Ruptures[which(Ruptures$part_id%in%children),]$distant_next_recovery)
    Ruptures[which(Ruptures$part_id==parents$part_id[i]),]$next_recovery = 
      sum( Ruptures[which(Ruptures$part_id%in%children),]$next_recovery)
    Ruptures[which(Ruptures$part_id==parents$part_id[i]),]$prev_recovery = 
      sum( Ruptures[which(Ruptures$part_id%in%children),]$prev_recovery)
    Ruptures[which(Ruptures$part_id==parents$part_id[i]),]$distant_prev_recovery = 
      sum( Ruptures[which(Ruptures$part_id%in%children),]$distant_prev_recovery)
    Ruptures[which(Ruptures$part_id==parents$part_id[i]),]$direct_recovery = 
      sum( Ruptures[which(Ruptures$part_id%in%children),]$direct_recovery)
  }
  
 
  
  
  ######################Parts Follow ######################
  parts=unique(data$part_id)
  nparts=length(parts)
  partFollow = matrix(nrow = nparts, ncol = nparts, data=0)
  parPreceed = matrix(nrow = nparts, ncol = nparts, data=0)
  for (u in 1:nusers)
  {
    
    userData = subset(data, data$user_id==users[u], select=c(id,part_index))  
    userData=userData[order(userData$id),]
    for(i in 1:nrow(userData)-1)
    {
      partFollow[userData[i,]$part_index, userData[i+1,]$part_index] =
        partFollow[userData[i,]$part_index, userData[i+1,]$part_index] + 1
      
      parPreceed[userData[i+1,]$part_index, userData[i,]$part_index] =
        parPreceed[userData[i+1,]$part_index, userData[i,]$part_index] + 1  
    }
  }
  
  
  
  ######## Parents Follow
  chaps=data.frame(parent_id= unique(structure[which(structure$type=='title-2'),]$part_id))
  chaps$chap_index=1:nrow(chaps)
  chaps$tome_index=0
  tomes = data.frame(tome_id= unique(structure[which(structure$type=='title-1'),]$part_id))
  tomes$tome_index=1:nrow(tomes)
  
  for(i in 1:nrow(chaps)){
    chap =   chaps[which(chaps$chap_index==i),]$parent_id
    parent = structure[which(structure$part_id==chap),]$parent_id
    parent_index = tomes[which(tomes$tome_id==parent),]$tome_index
    chaps[which(chaps$chap_index==i),]$tome_index=parent_index
  }
  
  structure = merge(structure, chaps, all.x = TRUE)
  data = merge(data, structure[,c('part_id','chap_index','tome_index')] , all.x = TRUE)
  
  
  
  
  #TomeFollow
  users = unique(data$user_id)
  nusers = length(users)
  tomes=unique(chaps$tome_index)
  ntomes=length(tomes)
  tomeFollow = matrix(nrow = ntomes, ncol = ntomes, data=0)
  
  for (u in 1:nusers)
  {
    
    userData = subset(data, data$user_id==users[u], select=c(id,tome_index))  
    userData=userData[order(userData$id),]
    userData = userData$tome_index
    
    for(i in 1:length(userData)-1)
    {
      tomeFollow[userData[i], userData[i+1]] =
        tomeFollow[userData[i], userData[i+1]]  + 1
    }
  }
  #save(tomeFollow, file='tomeFollow.rdata') ?????????????????
  
  
  res = list(data=data, structure=structure, RS=RS , Interest=Interest,Reads=Reads,Ruptures=Ruptures,partFollow=partFollow)
  return(res)
}


###############  COURSE DATA
course_data_calculation <- function(data,structure,indicators){
  Interest = indicators$Interest
  Reads = indicators$Reads
  Ruptures = indicators$Ruptures
  RS = indicators$RS
  partFollow = indicators$partFollow  
  
  
  ################################# PARTDATA ########################################################
  PartData = structure
  nParties = nrow(PartData[which(PartData$part_index==0),])
  PartData[which(PartData$part_index==0),]$part_index=-1*(0:(nParties-1))
  
  PartData[which(PartData$type=='title-1'),]$type='partie'
  PartData[which(PartData$type=='title-2'),]$type='chapitre'
  if(nrow(PartData[which(PartData$type=='title-3'),])>0)
    PartData[which(PartData$type=='title-3'),]$type='section'
  
  ############## SIZE : 1s video --> 2 mots. 1 image --> 30 mots
  
  if("vid_length" %in% colnames(PartData))
  {
   print("vids exist")
    PartData$size = PartData$size + PartData$vid_length * 2
  }
  if("nb_img" %in% colnames(PartData))
  {
   print("imgs exist")
    PartData$size = PartData$size +  PartData$nb_img * 30
  }
  
  
  tomesIds = PartData[which(PartData$type=='partie'),]$part_id
  for(i in 1:length(tomesIds)){
    PartData[which(PartData$part_id==tomesIds[i]),]$size =  sum(PartData[which(PartData$parent_id==tomesIds[i]),]$size)
    
  }
  
  PartData$speed=round(PartData$size/(PartData$mean.duration/60),2)
  PartData[is.na(PartData$speed),]$speed <- -1
  
  
  
  
  #################Prepare Transitions#####################
  part_indexes=1:(max(structure$part_index))
  Transitions = merge(data.frame(y=part_indexes),data.frame(x=part_indexes))
  Transitions = Transitions [,c('x','y')]
  Transitions$provenance  = 0
  Transitions$destination  = 0
  for(aPart in 1:max(structure$part_index))
  {
    partFollow[aPart,aPart]=0
  }
  
  partPrecedent <- t(partFollow)
  for(aPart in 1:max(structure$part_index))
  {
    
    nodes_dest = data.frame(part=1:(nrow(partFollow)), frequence=partFollow[aPart,])
    nodes_dest$ratio = nodes_dest$frequence/sum(nodes_dest$frequence)
    
    for(partDest in 1:max(structure$part_index)){
      Transitions[which((Transitions$x==aPart)&(Transitions$y==partDest)),]$destination=
        nodes_dest[nodes_dest$part==partDest,]$ratio
    }
    
    nodes_prov = data.frame(part=1:(nrow(partFollow)), frequence=partPrecedent[aPart,])
    nodes_prov$ratio = nodes_prov$frequence/sum(nodes_prov$frequence)
    
    for(partProv in 1:max(structure$part_index)){
      Transitions[which((Transitions$x==aPart)&(Transitions$y==partProv)),]$provenance=
        nodes_prov[nodes_prov$part==partProv,]$ratio
    }
    
  }
  TransitionsData=merge(Transitions, structure[,c('part_index','part_id')],by.x = 'x', by.y='part_index',all.x = TRUE)
  TransitionsData=TransitionsData[,c('part_id','y','provenance','destination')]
  names(TransitionsData)[1]='x'
  TransitionsData=merge(TransitionsData, structure[,c('part_index','part_id')],by.x = 'y', by.y='part_index',all.x = TRUE)
  TransitionsData=TransitionsData[,c('x','part_id','provenance','destination')]
  names(TransitionsData)[2]='y'
  
  
  
  
  Destinations_stats = data.frame(part_index=part_indexes,destination_next=0.0,destination_past=0.0,
                                  destination_future=0.0, destination_not_linear=0.0)
  for(aPart in 1:max(structure$part_index))
  { 
    partDestinations=Transitions[Transitions$x==aPart,c('y','destination')]
    
    Destinations_stats[Destinations_stats$part_index==aPart,]$destination_past = 
      sum(partDestinations[partDestinations$y<aPart,]$destination)
    Destinations_stats[Destinations_stats$part_index==aPart,]$destination_future = 
      sum(partDestinations[partDestinations$y>aPart+1,]$destination)  
    if(aPart<max(structure$part_index))
      Destinations_stats[Destinations_stats$part_index==aPart,]$destination_next = 
      partDestinations[partDestinations$y==aPart+1,]$destination
    Destinations_stats[Destinations_stats$part_index==aPart,]$destination_not_linear = 
      1.0 - (Destinations_stats[Destinations_stats$part_index==aPart,]$destination_next)
  }
  Destinations_stats = rbind(c(0,mean(Destinations_stats$destination_next),mean(Destinations_stats$destination_past),
                               mean(Destinations_stats$destination_future),mean(Destinations_stats$destination_not_linear)),
                             Destinations_stats)
  
  Provenances_stats = data.frame(part_index=part_indexes,provenance_prev=0.0,provenance_past=0.0,
                                 provenance_future=0.0, provenance_not_linear=0.0)
  
  for(aPart in 1:max(structure$part_index))
  { 
    partProvenances=Transitions[Transitions$x==aPart,c('y','provenance')]
    
    Provenances_stats[Provenances_stats$part_index==aPart,]$provenance_past = 
      sum(partProvenances[partProvenances$y<aPart-1,]$provenance)
    Provenances_stats[Provenances_stats$part_index==aPart,]$provenance_future = 
      sum(partProvenances[partProvenances$y>aPart,]$provenance)  
    if(aPart>1)
      Provenances_stats[Provenances_stats$part_index==aPart,]$provenance_prev = 
      partProvenances[partProvenances$y==aPart-1,]$provenance
    Provenances_stats[Provenances_stats$part_index==aPart,]$provenance_not_linear = 
      1.0 - (Provenances_stats[Provenances_stats$part_index==aPart,]$provenance_prev)
  }
  Provenances_stats = rbind(c(0,mean(Provenances_stats$provenance_prev),mean(Provenances_stats$provenance_past),
                              mean(Provenances_stats$provenance_future),mean(Provenances_stats$provenance_not_linear)),
                            Provenances_stats)
  
  #################Interest####################
  users=unique(data$user_id)
  nusers=length(users)
  PartData = merge(PartData, Reads[,-c(1)], all.x = TRUE)
  PartData = merge(PartData, Interest[,c('part_id','RS_nb')], all.x = TRUE)
  
  rs_nb = Interest[which(Interest$part_id== structure[which(structure$type=='course'),]$part_id),]$RS_nb
  PartData$Actions_tx = PartData$Actions_nb / nrow(data)
  PartData$readers_tx = PartData$Readers / nusers
  PartData$rs_tx = PartData$RS_nb / rs_nb
  PartData$invspeed = 0
  if(min(PartData$speed>0)){
  minspeed = min(PartData[PartData$speed>0,]$speed)
  maxspeed = max(PartData[PartData$speed>0,]$speed)
  PartData$invspeed = -1
  PartData[PartData$speed>0,]$invspeed = maxspeed- PartData[PartData$speed>0,]$speed
  
  PartData[PartData$speed>0,]$invspeed =range01(PartData[PartData$speed>0,]$invspeed, na.rm=TRUE)
  }
  
  PartData$interest =PartData$Actions_tx + PartData$readers_tx + PartData$rs_tx 
  #+ PartData$invspeed
  
  PartData[PartData$interest>0,]$interest = range01(PartData[PartData$interest>0,]$interest, na.rm=TRUE)
  
  #################FIN####################
  
  
  PartData = merge(PartData, Provenances_stats,  by = 'part_index',all.x = TRUE)
  PartData = merge(PartData, Destinations_stats,  by = 'part_index',all.x = TRUE)
  PartData$reading_not_linear = PartData$provenance_not_linear+ PartData$destination_not_linear 
  PartData$reading_not_linear = range01(PartData$reading_not_linear, na.rm=TRUE)
  
  PartData = merge(PartData, Ruptures[,-c(1)], all.x = TRUE)
  
  PartData$recovery=PartData$direct_recovery+PartData$distant_next_recovery+PartData$distant_prev_recovery+PartData$next_recovery+PartData$prev_recovery
  PartData$norecovery=PartData$rupture-PartData$recovery
  
  allRup = max(PartData$rupture, na.rm=TRUE)
  finalRupt = max(PartData$norecovery, na.rm=TRUE)
  
  PartData$rupture_tx = PartData$rupture/allRup
  PartData$norecovery_tx = PartData$norecovery/finalRupt
  
  
  PartData$resume_future= (PartData$distant_next_recovery)/PartData$recovery
  PartData$resume_past= (PartData$prev_recovery+PartData$distant_prev_recovery)/PartData$recovery
  PartData$resume_abnormal_tx = PartData$resume_future + PartData$resume_past
  
  
  ################### RELECTURE ######################################
  PartData$rereads_tx = 0
  PartData$rereads_globratio = 0
  allRereads = sum(PartData[which(PartData$type=='chapitre'),]$Rereadings, na.rm=TRUE)
  PartData[which(PartData$type=='chapitre'),]$rereads_tx =  PartData[which(PartData$type=='chapitre'),]$Rereadings / PartData[which(PartData$type=='chapitre'),]$Readings
  PartData[which(PartData$type=='chapitre'),]$rereads_globratio =  PartData[which(PartData$type=='chapitre'),]$Rereadings / allRereads
  # for chapters
  tomeIds = PartData[which(PartData$type=='partie'),]$part_id
  for(i in 1:length(tomeIds)){
    PartData[which(PartData$part_id==tomeIds[i]),]$rereads_tx =  mean(PartData[which(PartData$parent_id==tomeIds[i]),]$rereads_tx)
    PartData[which(PartData$part_id==tomeIds[i]),]$rereads_globratio =  mean(PartData[which(PartData$parent_id==tomeIds[i]),]$rereads_globratio)
  }
  
  PartData$mean.tx_total_rereaders = round(100 * PartData$Rereaders / PartData$Readers, 2) 
  PartData$mean.tx_total_readers = round(100 * PartData$Rereaders / nusers, 2) 
  
  PartData$rereads_seq_tx = 0
 
  sumseq = sum(PartData[which(PartData$type=='chapitre'),]$Sequential_rereadings, na.rm=TRUE)
  PartData[which(PartData$type=='chapitre'),]$rereads_seq_tx =   PartData[which(PartData$type=='chapitre'),]$Sequential_rereadings / sumseq
  # for tomes
  tomeIds = PartData[which(PartData$type=='partie'),]$part_id
  for(i in 1:length(tomeIds)){
    PartData[which(PartData$part_id==tomeIds[i]),]$rereads_seq_tx =  mean(PartData[which(PartData$parent_id==tomeIds[i]),]$rereads_seq_tx)
  }
  # for all course
  PartData[which(PartData$type=='course'),]$rereads_seq_tx =  mean(PartData[which(PartData$type=='chapitre'),]$rereads_seq_tx)
  
  
  PartData$rereads_dec_tx = 0
  sumdec = sum(PartData[which(PartData$type=='chapitre'),]$Decaled_rereadings, na.rm=TRUE)
  PartData[which(PartData$type=='chapitre'),]$rereads_dec_tx =   PartData[which(PartData$type=='chapitre'),]$Decaled_rereadings / sumdec
  # for chapters
  tomeIds = PartData[which(PartData$type=='partie'),]$part_id
  for(i in 1:length(tomeIds)){
    PartData[which(PartData$part_id==tomeIds[i]),]$rereads_dec_tx =  mean(PartData[which(PartData$parent_id==tomeIds[i]),]$rereads_dec_tx)    
  }
  # for all course
  PartData[which(PartData$type=='course'),]$rereads_dec_tx =  mean(PartData[which(PartData$type=='chapitre'),]$rereads_dec_tx)
  
  
  ####################FIN####################
  PartData[PartData$type=='course',]$speed =
    mean(PartData[PartData$type=='chapitre',]$speed)
  PartData[PartData$type=='course',]$rereadings_tx =
    mean(PartData[PartData$type=='chapitre',]$rereadings_tx)
  PartData[PartData$type=='course',]$Actions_tx =
    mean(PartData[PartData$type=='chapitre',]$Actions_tx)
  PartData[PartData$type=='course',]$readers_tx =
    mean(PartData[PartData$type=='chapitre',]$readers_tx)
  PartData[PartData$type=='course',]$rs_tx =
    mean(PartData[PartData$type=='chapitre',]$rs_tx)
  PartData[PartData$type=='course',]$rupture_tx =
    mean(PartData[PartData$type=='chapitre',]$rupture_tx)
  PartData[PartData$type=='course',]$norecovery_tx =
    mean(PartData[PartData$type=='chapitre',]$norecovery_tx)
  PartData[PartData$type=='course',]$rereads_tx =
    mean(PartData[PartData$type=='chapitre',]$rereads_tx)
  
  PartData=PartData[,c("part_index","part_id","parent_id","title","type", "slug", "max.duration"  ,  "mean.duration"  ,
                       "median.duration" ,"q1.duration" , "q3.duration", "size", "speed" ,"interest" , "Actions_nb",
                       "Readers", "Rereaders" , "Readings","readers_tx", "Actions_tx","rs_tx",
                       "Rereadings", "rereads_tx", "rereads_seq_tx" ,  "rereads_dec_tx", 
                       "Sequential_rereadings" ,"Decaled_rereadings",  "reading_not_linear",
                       "provenance_prev" , "provenance_not_linear", "provenance_past",  "provenance_future" ,
                       "destination_next", "destination_not_linear","destination_past" ,"destination_future"  ,
                       "rupture_tx", "norecovery_tx","resume_abnormal_tx" ,"resume_past","resume_future")]
  
  
  
  colnames(PartData)[1]="id"
  
  ####################Arrange structure
  #st = PartData[PartData$id>0,c('id','parent_id')]
  #st=unique(st[order(st$id),]$parent_id)
  #st = data.frame(part_id=st, tome_index=1:length(st))
  
  #PartData=merge(PartData,st,all.x = TRUE)
  #write.csv2(structure,'structure.csv')
  
  #MANUALLY !!!!!!!!!!!!!!!!!!!
  
  #structure = read.csv('structure.csv', stringsAsFactors=FALSE)
  
  #save(structure, file="structure.rdata")
  #View(PartData[,c('tome_index','chap_index','part_index')])
  
  #save(PartData, file='../coursesdata/PartData.rdata')
  
  #################### EXPORT
  
  
  ########## Stats 
  CourseData = data.frame(id=0, title=PartData[PartData$type=='course','title'])
  CourseData$nactions =sum(PartData[PartData$type=='chapitre','Actions_nb'])
  CourseData$nusers =length(unique(data$user_id))  
  CourseData$nRS = nrow(RS)
  CourseData$RS_meanparts = mean(RS$nparts)
  CourseData$RS_meanperuser = nrow(RS)/nusers
  CourseData$ob_begin=as.character(min(data$date))
  CourseData$ob_end=as.character(max(data$date))
  
  
  
  
  res = list(PartData=PartData,CourseData=CourseData, TransitionsData=TransitionsData)
  return(res) 
  
}

###############  COURSE ISSUES
course_issues_calculation <- function(data, structure,PartData){
  
  ######################INDICATORS INIT.###############################
  minInterest =
  minVisits =   	# Actions_tx
    minReaders = 		# readers_tx 			<----------
  minRS = 		# rs_tx  			<----------
  maxSpeed = 		# speed
    
    maxRereadings = 	# rereads_tx
    maxDijRereadings = 	# rereads_dec_tx
    maxConjRereadings = 	# rereads_seq_tx
    
    readingLinearity = 	# reading_not_linear  		<----------
  provenanceLinearity = 	# provenance_not_linear
    provenanceFuture = 	# provenance_future
    provenancePast = 	# provenance_past
    destinationLinearity = # destination_not_linear
    destinationFuture = 	# destination_future
    destinationPast = 	# destination_past
    
    maxRSStops = 		# rupture_tx
    maxFinalStops = 	# norecovery_tx
    resumeLinearity = 	# resume_abnormal_tx  		<----------
  recoveryPast = 	# resume_past
    recoveryFuture =	#resume_future
    data.frame(part_id=integer(),value=character(),classe=character(),issueCode=character(),content=character(),delta=numeric(),
               description=character(),suggestion_title=character(),suggestion_content=character()) 
  
  
  chaptersData = PartData[which(PartData$type=='chapitre'),]
  
   ####### TROP PEU D'INTERET
  
  byChaps = chaptersData[(DoubleMADsFromMedian(chaptersData$interest)>2)&(chaptersData$interest<median(chaptersData$interest) ),c('part_id','interest')]
  if(nrow(byChaps)>0){
    byChaps$classe="interest"
    byChaps$issueCode="RminInterest"
    byChaps$content="Trop peu d'intérêt"
    byChaps$delta  = median(chaptersData$interest,na.rm = TRUE)- byChaps$interest
    val = round(median(chaptersData$interest,na.rm = TRUE)/ byChaps$interest,2)
    byChaps$description=paste("Le taux d'intéret calculé pour ce chapitre est très réduit. Il est", val,"fois moins que le le taux médian des autres chapitres")
    byChaps$suggestion_title="Revoir le titre et le contenu"
    byChaps$suggestion_content="Est-ce que le titre du chapitre  résume bien son contenu ? 
    Si oui :  Est-ce que ce chapitre est  réellement intéressant par rapport au cours ? Si c'est le cas, peut-il
    être reformulé, voire intégré ailleurs dans le cours ?  Sinon, la supprimer et revoir le plan de la partie chapitre et du cours. 
    Le cas échéant, il faudrait penser à le reformuler"
    
    #minVisits = rbind(byParts,byChaps)
    minInterest = byChaps
  }
  
  ####### NOMBRE DE VISITES TROP PEU   
  
  byChaps = chaptersData[(DoubleMADsFromMedian(chaptersData$Actions_tx)>2)&(chaptersData$Actions_tx<median(chaptersData$Actions_tx) ),c('part_id','Actions_tx')]
  if(nrow(byChaps)>0){
    byChaps$classe="Actions_tx"
    byChaps$issueCode="RminVisit"
    byChaps$content="Trop peu de visites"
    byChaps$delta  = median(chaptersData$Actions_tx,na.rm = TRUE)- byChaps$Actions_tx
    val = round(median(chaptersData$Actions_tx,na.rm = TRUE)/ byChaps$Actions_tx,2)
    byChaps$description=paste("Ce chapitre est visité", val,"fois moins que le nombre médian de visites des autres chapitres")
    byChaps$suggestion_title="Revoir le titre et le contenu"
    byChaps$suggestion_content="Est-ce que le titre du chapitre  résume bien son contenu ? 
    Si oui :  Est-ce que ce chapitre est  réellement intéressant par rapport au cours ? Si c'est le cas, peut-il
    être reformulé, voire intégré ailleurs dans le cours ?  Sinon, la supprimer et revoir le plan de la partie chapitre et du cours. 
    Le cas échéant, il faudrait penser à le reformuler"
    
    #minVisits = rbind(byParts,byChaps)
    minVisits = byChaps
  }
  
  ####### NOMBRE DE LECTEURS TROP PEU   
  
  byChaps = chaptersData[(DoubleMADsFromMedian(chaptersData$readers_tx)>2)&(chaptersData$readers_tx<median(chaptersData$readers_tx) ),c('part_id','readers_tx')]
  if(nrow(byChaps)>0){
    byChaps$classe="readers_tx"
    byChaps$issueCode="RminReaders"
    byChaps$content="Trop peu de lecteurs"
    byChaps$delta  = median(chaptersData$readers_tx,na.rm = TRUE)- byChaps$readers_tx
    val = round(median(chaptersData$readers_tx,na.rm = TRUE)/ byChaps$readers_tx,2)
    byChaps$description=paste("Ce chapitre est lu par", val,"fois moins de lecteurs que le nombre médian de lecteurs des autres chapitres")
    byChaps$suggestion_title="Revoir le titre et le contenu"
    byChaps$suggestion_content="Est-ce que le titre du chapitre  résume bien son contenu ? 
    Si oui :  Est-ce que ce chapitre est  réellement intéressant par rapport au cours ? Si c'est le cas, peut-il
    être reformulé, voire intégré ailleurs dans le cours ?  Sinon, la supprimer et revoir le plan de la partie chapitre et du cours. 
    Le cas échéant, il faudrait penser à le reformuler"
    
    #minVisits = rbind(byParts,byChaps)
    minReaders = byChaps
  }
  
  
  ####### DUREE MIN
  #NO DUration
  if(FALSE){
    DurationData = PartData[which(PartData$type=='section'),c('part_id','mean.duration')]
    
    byParts = DurationData[which(DurationData$mean.duration<=quantile(DurationData$mean.duration,0.10,na.rm = TRUE) ),]
    byParts$classe="mean.duration"
    byParts$issueCode="RminDuration"
    byParts$content="Temps de lecture trop court"
    val = round(median(DurationData$mean.duration,na.rm = TRUE) / byParts$mean.duration,0)
    byParts$description=paste("Cette section est plutôt survolée : son temps de lecture est",val,"fois inférieur au temps médian")
    byParts$suggestion_title="Réviser ou supprimer la section"
    byParts$suggestion_content="La section doit apporter plus d'informations nouvelles / intéressantes : 
    Si cette section est réellement nécessaire : peut-elle être reformulée, voire intégrée dans un autre chapitre ou une autre section du cours ?
    Sinon, la supprimer et revoir le plan du chapitre et du cours."
  }
  
  DurationData = PartData[which(PartData$type=='chapitre'),c('part_id','mean.duration')]
  
  byChaps = DurationData[which(DurationData$mean.duration<=quantile(DurationData$mean.duration,0.10,na.rm = TRUE) ),]
  if(nrow(byChaps)>0){  byChaps$classe="mean.duration"
                        byChaps$issueCode="RminDuration"
                        byChaps$content="Temps de lecture trop court"
                        val = round(median(DurationData$mean.duration,na.rm = TRUE) / byChaps$mean.duration,0)
                        byChaps$description=paste("Ce chapitre est plutôt survolé : son temps de lecture est",val,"fois inférieur au temps médian")
                        byChaps$suggestion_title="Réviser ou supprimer le chapitre"
                        byChaps$suggestion_content="Le chapitre doit apporter plus d'informations nouvelles / intéressantes : 
                        Si  le chapitre est réellement nécessaire : peut-il être reformulé, voire intégré dans un autre chapitre ou  partie du cours ?
                        Sinon, le supprimer et revoir le plan de la partie chapitre et du cours."
                        
                        if(FALSE){
                          DurationData = PartData[which(PartData$type=='partie'),c('part_id','mean.duration')]
                          
                          byTomes = DurationData[which(DurationData$mean.duration<=quantile(DurationData$mean.duration,0.10,na.rm = TRUE) ),]
                          byTomes$classe="mean.duration"
                          byTomes$issueCode="RminDuration"
                          byTomes$content="Temps de lecture trop court"
                          val = round(median(DurationData$mean.duration,na.rm = TRUE) / byTomes$mean.duration,0)
                          byTomes$description=paste("Cette partie est plutôt survolée : son temps de lecture est",val,"fois inférieur au temps médian")
                          byTomes$suggestion_title="Réviser ou supprimer la partie"
                          byTomes$suggestion_content="La partie doit apporter plus d'informations nouvelles / intéressantes : 
                          Si la partie est réellement nécessaire : peut-elle être reformulée, voire intégrée dans une partie du cours ?
                          Sinon, la supprimer et revoir le plan du cours."  
                        }
                        
                        #minDuration =  rbind(byParts,byChaps,byTomes)
                        minDuration =  byChaps
                        }
  ################## Vitesse MAX  
  if(min(PartData$speed>0)){
  byChaps = chaptersData[(DoubleMADsFromMedian(chaptersData$speed)>2)&(chaptersData$speed>median(chaptersData$speed) ),c('part_id','speed')]  
  if(nrow(byChaps)>0){
    byChaps$classe="speed"
    byChaps$issueCode="RmaxSpeed"
    byChaps$content="Lecture trop rapide"
    byChaps$delta = byChaps$speed - median(chaptersData$speed,na.rm = TRUE) 
    val = round(byChaps$speed / median(chaptersData$speed,na.rm = TRUE) ,2)
    byChaps$description=paste("Ce chapitre  comporte probablement trop peu d'éléments nouveaux, intéressants : la vitesse moyenne de lecture étant",val,"fois supéreire à la vitesse moyenne de lecture des autres chapitres")
    byChaps$suggestion_title="Réviser ou supprimer le chapitre"
    byChaps$suggestion_content="Le chapitre doit être plus simple à lire/comprendre : 
    - utiliser un vocabulaire plus commun ou directement défini dans le texte, 
    - vérifier l'enchaînement logique des propos
    - ajouter des exemples/analogies pour améliorer la compréhension
    - éviter les dispersions : aller à l'essentiel."
    
    #minSpeed =  rbind(byParts,byChaps)
    minSpeed =  byChaps
  }
  }
  ################## Vitesse MIN
  if(min(PartData$speed>0)){
  byChaps = chaptersData[(DoubleMADsFromMedian(chaptersData$speed)>2)&(chaptersData$speed<median(chaptersData$speed) ),c('part_id','speed')]
  if(nrow(byChaps)>0){
    byChaps$classe="speed"
    byChaps$issueCode="RminSpeed"
    byChaps$content="Lecture trop rapide"
    byChaps$delta = median(chaptersData$speed,na.rm = TRUE) /byChaps$speed
    val = round(median(chaptersData$speed,na.rm = TRUE) /byChaps$speed  ,2)
    byChaps$description=paste("Cette section est probablement trop longue ou contient beaucoup de notions complexes ou nouvelles, sa vitesse moyenne de lecture étant", val,"fois inférieure à la vitesse moyenne de lecture des autres section")
    byChaps$suggestion_title="Réviser le chapitre"
    byChaps$suggestion_content="Le chapitre doit être plus simple à lire/comprendre : 
    - utiliser un vocabulaire plus commun ou directement défini dans le texte, 
    - vérifier l'enchaînement logique des propos
    - ajouter des exemples/analogies pour améliorer la compréhension
    - éviter les dispersions : aller à l'essentiel."
    
    #  maxSpeed =  rbind(byParts,byChaps)
    maxSpeed =  byChaps
  }
  }
  ####### MAX REREADINGS
  byChaps = chaptersData[(DoubleMADsFromMedian(chaptersData$rereads_tx)>2)&
                           (chaptersData$rereads_tx>median(chaptersData$rereads_tx) ),c('part_id','rereads_tx')]
  if(nrow(byChaps)>0){
    byChaps$classe="rereads_tx"
    byChaps$issueCode="RRmax"
    byChaps$content="Trop de relectures"
    byChaps$delta=byChaps$rereads_tx-median(chaptersData$rereads_tx)
    val = round(byChaps$rereads_tx/median(chaptersData$rereads_tx),2)
    byChaps$description=paste("Les sections de ce chapitre sont en moyenne relues",val,"fois plus que le nombre moyen de relectures des sections des autres chapitres")
    byChaps$suggestion_title="Simplifier l'écriture du chapitre et vérifier l'enchainement des sections"
    byChaps$suggestion_content="Le chapitre et ses sections doivent être plus simples à  lire et comprendre : 
    - utiliser un vocabulaire plus commun ou directement défini dans le texte, 
    - vérifier l'enchaînement logique des propos
    - ajouter des exemples/analogies pour améliorer la compréhension
    - éviter les dispersions : aller à  l'essentiel.
    Sinon, regarder l'indicateur de relecture plus spécifique (même séance ou séances disjointes) pour suggestion"
    
    
    #maxRereadings =  rbind(byParts,byChaps)
    maxRereadings =  byChaps
  }
  
  ####### Max Conjoint Rereadings
  byChaps = chaptersData[(DoubleMADsFromMedian(chaptersData$rereads_seq_tx)>2)&
                           (chaptersData$rereads_seq_tx>median(chaptersData$rereads_seq_tx) ),c('part_id','rereads_seq_tx')]
  if(nrow(byChaps)>0){
    byChaps=byChaps[,c('part_id','rereads_seq_tx')]
    byChaps$classe="rereads_seq_tx"
    byChaps$issueCode="rereads_seq_tx"
    byChaps$content="Beaucoup de relectures conjointes (i.e. dans les mêmes séances de lecture)"
    byChaps$delta=byChaps$rereads_seq_tx-median(chaptersData$rereads_seq_tx)
    val = round(byChaps$rereads_seq_tx/median(chaptersData$rereads_seq_tx),2)
    byChaps$description=paste("Ce chapitre est en moyenne relu successivement dans les mêmes séances de lecture",val,"fois plus que les autres chapitres")
    byChaps$suggestion_title="Simplifier l'écriture du chapitre et vérifier l'enchainement des sections"
    byChaps$suggestion_content="Ce chapitre est un préquis ou contient des sections qui snt des prérquis à la lecture d’autre(s) chapitre(s)/partie(s). 
    N’y a t-il pas une restructuration du cours, du chapitre et de la partie le contenant plus intéressante pour éviter ce phénomène (par exemple, déplacer le chapitre ou l’englober dans une autre chapitre ou partie) ?
    "
    maxConjRereadings =  byChaps 
  }
  
  ####### Max Disjoint Rereadings
  byChaps = chaptersData[(DoubleMADsFromMedian(chaptersData$rereads_dec_tx)>2)&
                           (chaptersData$rereads_dec_tx>median(chaptersData$rereads_dec_tx) ),c('part_id','rereads_dec_tx')]
  if(nrow(byChaps)>0){
    byChaps=byChaps[,c('part_id','rereads_dec_tx')]
    byChaps$classe="rereads_dec_tx"
    byChaps$issueCode="rereads_dec_tx"
    byChaps$content="Beaucoup de relectures disjointes (i.e. dans des séances de lecture distinctes)"
    byChaps$delta=byChaps$rereads_dec_tx-median(chaptersData$rereads_dec_tx)
    val = round(byChaps$rereads_dec_tx/median(chaptersData$rereads_dec_tx),2)
    byChaps$description=paste("Les sections de ce chapitre sont en moyenne relues dans des sections différentes",val,"fois plus que le nombre moyen de relectures disjointes des sections des autres chapitres")
    byChaps$suggestion_title="Simplifier l'écriture du chapitre et vérifier l'enchainement des sections"
    byChaps$suggestion_content="Ce chapitre est un préquis ou contient des sections qui snt des prérquis à la lecture d’autre(s) chapitre(s)/partie(s). 
    N’y a t-il pas une restructuration du cours, du chapitre et de la partie le contenant plus intéressante pour éviter ce phénomène (par exemple, déplacer le chapitre ou l’englober dans une autre chapitre ou partie) ?
    "
    maxDijRereadings =  byChaps
  }
  ####### Reading Linearity
  byChaps = chaptersData[(DoubleMADsFromMedian(chaptersData$reading_not_linear)>2)&
                           (chaptersData$reading_not_linear>median(chaptersData$reading_not_linear) ),c('part_id','reading_not_linear')]
  
  if(nrow(byChaps)>0){
    byChaps$classe="reading_not_linear"
    byChaps$issueCode="TransProvShift"
    byChaps$content="Trop de navigation non linéaires (non consécutives) impliquant se chapitre"
    byChaps$delta = byChaps$reading_not_linear
    byChaps$description=paste("Dans",round(100*byChaps$reading_not_linear,2),"% des cas, le chapitre lu avant celui-ci n'est pas le chapitre qui le précède directement dans la structure du cours.")
    byChaps$suggestion_title="Revoir le contenu et la position du chapitre dans le plan du cours"
    byChaps$suggestion_content="Est-ce que ce chapitre est bien positionné dans le plan de la partie et du cours ?"
    
    
    readingLinearity = byChaps
  }
  ####### Provenance Linearity
  byChaps=subset(chaptersData, chaptersData$provenance_not_linear>0.5 , select=c('part_id','provenance_not_linear')) 
  if(nrow(byChaps)>0){
    byChaps$classe="provenance_not_linear"
    byChaps$issueCode="TransProvShift"
    byChaps$content="Trop d\'arrivées non linéaires (non consécutives) sur se chapitre"
    byChaps$delta = byChaps$provenance_not_linear
    byChaps$description=paste("Dans",round(100*byChaps$provenance_not_linear,2),"% des cas, le chapitre lu avant celui-ci n'est pas le chapitre qui le précède directement dans la structure du cours.")
    byChaps$suggestion_title="Revoir le contenu et la position du chapitre dans le plan du cours"
    byChaps$suggestion_content="Est-ce que ce chapitre est bien positionné dans le plan de la partie et du cours ?
    Si vous remarquez beaucoup de retour vers ce chapitre depuis des chapitres bien avant, il se peut que 
    ce  chapitre soitun pré-requis à la lecture d'autre(s) chapitre(s) ou partie(s), n'y a t-il pas une restructuration du cours/chapitre/partie plus intéressante pour éviter ce phénomène ?"
    
    
    provenanceLinearity = byChaps
  }
  
  ####### Provenance Future
  byChaps=subset(chaptersData, (chaptersData$provenance_future>0.5) && (chaptersData$id!=1) , select=c('part_id','provenance_future')) 
  if(nrow(byChaps)>0){
    byChaps$classe="provenance_future"
    byChaps$issueCode="TransProvFuture"
    byChaps$content="Trop d\'arrivées non linéaires depuis des chapitres plus en avant"
    byChaps$delta = byChaps$provenance_future
    byChaps$description=paste("Dans",round(100*byChaps$provenance_not_linear,2),"% des cas, le chapitre lu avant celui-ci  est un chapitre situé après ce chapitre dans le plan du cours")
    byChaps$suggestion_title="Revoir le contenu et la position du chapitre dans le plan du cours"
    byChaps$suggestion_content="Est-ce que ce chapitre est bien positionné dans le plan de la partie et du cours ?
    Il se peut que  ce chapitre soit un pré-requis important à la lecture d'autre(s) chapitre(s) ou partie(s), n'y a t-il pas une restructuration du cours/chapitre/partie plus intéressante pour éviter ce phénomène ?"
    
    
    provenanceFuture = byChaps
  }
  
  ####### Provenance Past
  byChaps=subset(chaptersData, (chaptersData$provenance_past>0.3)&& (chaptersData$id!=1) , select=c('part_id','provenance_past')) 
  if(nrow(byChaps)>0){
    byChaps$classe="provenance_past"
    byChaps$issueCode="TransProvShift"
    byChaps$content="Trop d\'arrivées non linéaires depuis des chapitres plus en arrière"
    byChaps$delta = byChaps$provenance_past
    byChaps$description=paste("Dans",round(100*byChaps$provenance_past,2),"% des cas, le chapitre lu avant celui-ci se situe bien avant le chapitre précédent dans la structure du cours.")
    byChaps$suggestion_title="Revoir le contenu et la position du chapitre dans le plan du cours"
    byChaps$suggestion_content="Est-ce que ce chapitre est bien positionné dans le plan de la partie et du cours ?"  
    
    provenancePast = byChaps
  }
  
  ####### Destination Linearity
  byChaps=subset(chaptersData, chaptersData$destination_not_linear >0.5 , select=c('part_id','destination_not_linear')) 
  if(nrow(byChaps)>0){
    byChaps$classe="destination_not_linear"
    byChaps$issueCode="TransDestShift"
    byChaps$content="Trop de sauts vers des chapitres lointains"
    byChaps$description=paste("Dans",round(100*byChaps$destination_not_linear,2),"% des cas, le chapitre lu après ce chapitre n'est pas celui qui le suit dans la structure du cours mais est un chapitre distant.")
    byChaps$delta=byChaps$destination_not_linear
    byChaps$suggestion_title="Revoir le contenu et la position du chapitre dans le plan du cours"
    byChaps$suggestion_content="Est-ce que ce chapitre est bien positionné dans le plan du cours ?
    Est-ce que ce chapitre et ceux voisins qui le suivent sont réellement pertinents ? Essayez de revoir ce contenu afin que les lecteurs n'aient plus besoin d'aller sur d'autres chapitres pour comprendre ce dernier."
    
    destinationLinearity = byChaps
  }
  ####### Destination Future
  byChaps=subset(chaptersData, chaptersData$destination_future >0.3 , select=c('part_id','destination_future')) 
  if(nrow(byChaps)>0){
    byChaps$classe="destination_future"
    byChaps$issueCode="TransDestFuture"
    byChaps$content="Trop de sauts vers des chapitres lointains"
    byChaps$description=paste("Dans",round(100*byChaps$destination_future,2),"% des cas, 
                              le chapitre lu après ce chapitre n'est pas celui qui le suit dans la structure du cours mais se siture plus en avant.")
    byChaps$delta=byChaps$destination_future
    byChaps$suggestion_title="Revoir le contenu et la position du chapitre dans le plan du cours"
    byChaps$suggestion_content="Est-ce que ce chapitre est bien positionné dans le plan du cours ?
    Est-ce que ce chapitre et ceux voisins qui le suivent sont réellement pertinents ? Essayez de revoir ce contenu afin que les lecteurs n'aient plus besoin d'aller sur d'autres chapitres pour comprendre ce dernier."
    
    destinationFuture = byChaps
  }
  ####### Destination Past
  byChaps=subset(chaptersData, chaptersData$destination_past >0.5 , select=c('part_id','destination_past')) 
  if(nrow(byChaps)>0){
    byChaps$classe="destination_past"
    byChaps$issueCode="TransDestPast"
    byChaps$content="Trop de sauts vers des chapitres plus en arrière"
    byChaps$description=paste("Dans",round(100*byChaps$destination_past,2),"% des cas, le chapitre lu après ce chapitre se situe avant celui-ci dans la structure du cours")
    byChaps$delta=byChaps$destination_past
    byChaps$suggestion_title="Revoir le contenu et la position du chapitre dans le plan du cours"
    byChaps$suggestion_content="Est-ce que ce chapitre est bien positionné dans le plan du cours ?
    Est-ce que ce chapitre et ceux voisins qui le suivent sont réellement pertinents ? Essayez de revoir ce contenu afin que les lecteurs n'aient plus besoin d'aller sur d'autres chapitres pour comprendre ce dernier."
    
    destinationPast = byChaps
  }
  ########### Session end
  byChaps = chaptersData[(DoubleMADsFromMedian(chaptersData$rupture_tx)>2)&
                           (chaptersData$rupture_tx>median(chaptersData$rupture_tx) ),c('part_id','rupture_tx')]
  if(nrow(byChaps)>0){
    byChaps$classe="rupture_tx"
    byChaps$issueCode="StopRSEnd"
    byChaps$content="Trop de séances de lecture se terminent sur ce chapitre"
    byChaps$description=paste(round(100*byChaps$rupture_tx,2),"% des séances de lecture se terminent sur ce chapitre.")
    byChaps$delta=round(100*byChaps$rupture_tx,2)
    byChaps$suggestion_title="Réécrire et simplifier ce chapitre"
    byChaps$suggestion_content="Ce chapitre a besoin d\'être plus simple à lire et à comprendre : 
    - utiliser un vocabulaire plus commun ou directement défini dans le texte, 
    - vérifier l'enchaînement logique des propos
    - ajouter des exemples/analogies pour améliorer la compréhension
    - éviter les dispersions : aller à l\'essentiel"
    maxRSStops =   byChaps
  }
  
  ####### Max Stops
  byChaps = chaptersData[(DoubleMADsFromMedian(chaptersData$norecovery_tx)>2)&
                           (chaptersData$norecovery_tx>median(chaptersData$norecovery_tx) ),c('part_id','norecovery_tx')]
  
  if(nrow(byChaps)>0){
    byChaps$classe="norecovery_tx"
    byChaps$issueCode="StopRSExit"
    byChaps$content=paste("Trop d'arrêts définitifs de la lecture sur ce chapitre")
    byChaps$delta=byChaps$norecovery_tx - median(chaptersData$norecovery_tx)
    val = round(100*byChaps$norecovery_tx,2)
    byChaps$description=paste(val, "% des fins définitives de la lecture  (sans reprises ultérieures) se passent sur ce chapitre.")
    byChaps$suggestion_title="Réécrire et simplifier ce chapitre"
    byChaps$suggestion_content="Ce chapitre a besoin d\'être plus simple à lire et à comprendre : 
    - utiliser un vocabulaire plus commun ou directement défini dans le texte, 
    - vérifier l'enchaînement logique des propos
    - ajouter des exemples/analogies pour améliorer la compréhension
    - éviter les dispersions : aller à l\'essentiel"
    
    maxFinalStops =   byChaps
  }
  
  ####### Recovery ANormal
  byChaps = subset(chaptersData, chaptersData$resume_abnormal_tx > 0.5 , select=c('part_id','resume_abnormal_tx')) 
  if(nrow(byChaps)>0){
    byChaps$classe="resume_abnormal_tx"
    byChaps$issueCode="StopResumeBack"
    byChaps$content="Après arrêt de la lecture sur ce chapitre, trop de de reprise sur des chapitres lointains (en avant ou en arrière)"
    byChaps$delta = byChaps$resume_abnormal_tx
    byChaps$description=paste(round(100*byChaps$resume_abnormal_tx,2),"% des reprises de la lecture après arrêt sur ce chapitre se font sur des chapitres précédents.")
    byChaps$suggestion_title="Revoir ce chapitre et les chapitres voisins directs"
    byChaps$suggestion_content="Les chapitres précédents voisins de  ce chapitre doivent probablement être des pré-requis importants pour continuer la lecture. 
    Dans le cas contraire, ces chapitres-là doivent peut-être être plus simple à lire/comprendre (cf. problèmes éventuels de relecture pour les chapitres en question)."
    
    resumeLinearity =   byChaps
  }
  
  ####### Recovery Past
  byChaps = subset(chaptersData, chaptersData$resume_past > 0.33 , select=c('part_id','resume_past')) 
  if(nrow(byChaps)>0){
    byChaps$classe="resume_past"
    byChaps$issueCode="StopResumeBack"
    byChaps$content="Après fait de lecture sur ce chapitre, trop de de reprise se font sur des chapitres précédents"
    byChaps$delta = byChaps$resume_past
    byChaps$description=paste(round(100*byChaps$resume_past,2),"% des reprises de la lecture après arrêt sur ce chapitre se font sur des chapitres précédents.")
    byChaps$suggestion_title="Revoir ce chapitre et les chapitres voisins directs"
    byChaps$suggestion_content="Les chapitres précédents voisins de  ce chapitre doivent probablement être des pré-requis importants pour continuer la lecture. 
    Dans le cas contraire, ces chapitres-là doivent peut-être être plus simple à lire/comprendre (cf. problèmes éventuels de relecture pour les chapitres en question)."
    
    recoveryPast =   byChaps
  }
  
  ####### Recovery Past
  byChaps = subset(chaptersData, chaptersData$resume_future > 0.33 , select=c('part_id','resume_future')) 
  if(nrow(byChaps)>0){
    byChaps$classe="resume_future"
    byChaps$issueCode="StopResumeBack"
    byChaps$content="Après fait de lecture sur ce chapitre, trop de de reprise se font sur des chapitres suivants éloignés"
    byChaps$delta = byChaps$resume_future
    byChaps$description=paste(round(100*byChaps$resume_future,2),"% des reprises de la lecture après arrêt sur ce chapitre se font sur des chapitres suivants éloignés (au-dela du prochain chapitre")
    byChaps$suggestion_title="Revoir ce chapitre et les chapitres voisins directs"
    byChaps$suggestion_content="Est-ce que ce chapitre est bien positionné dans le plan du cours ?
    Est-ce que ce chapitre et ceux voisines suivants sont réellement pertinents ?"
    
    recoveryFuture =   byChaps
  }
  
  ##############CONCATENATE EVERYTHING##############
  
  names(minVisits)[c(1,2)]=
    names(minReaders)[c(1,2)]=   
    names(maxRereadings)[c(1,2)]=
    names(maxDijRereadings)[c(1,2)]=
    names(maxConjRereadings)[c(1,2)]=
    names(readingLinearity)[c(1,2)]=
    names(provenanceLinearity)[c(1,2)]=
    names(provenancePast)[c(1,2)]=
    names(provenanceFuture)[c(1,2)]=
    names(destinationLinearity)[c(1,2)]=
    names(destinationPast)[c(1,2)]=
    names(destinationFuture)[c(1,2)]=
    names(maxRSStops)[c(1,2)]=  
    names(maxFinalStops)[c(1,2)]=
    names(resumeLinearity)[c(1,2)]=
    names(recoveryPast)[c(1,2)]=
    names(recoveryFuture)[c(1,2)]=
    c("part_id","value")
    
   
  
  
  facts = 
    rbind(
      minVisits,
      minReaders,
      maxRereadings,
      maxDijRereadings,
      maxConjRereadings,
      readingLinearity,
      provenanceLinearity,
      provenancePast,
      provenanceFuture,
      destinationLinearity,
      destinationPast,
      destinationFuture,
      maxRSStops,
      maxFinalStops,
      resumeLinearity,
      recoveryFuture,
      recoveryPast)
 if(min(PartData$speed>0)){
  names(minSpeed)[c(1,2)]=
    names(maxSpeed)[c(1,2)]=c("part_id","value")
    facts =  rbind(facts,minSpeed,maxSpeed)
 }
      return(facts)
  
  
}

###################################################### DO
params = fromJSON(jsonObj)
do_course(params$csv_f,params$json_f)
#csv_f = "/home/madjid/Dropbox/rcoreada/Dataset/1885491/data.csv"
#json_f = "/home/madjid/Dropbox/rcoreada/Dataset/1885491/structure.json"
#do_course(csv_f,json_f)

####################################### END ##################################################################### 
}
###############  INITIAL FULLDATA ###########################


initfulldata <- function(home){
#
setwd(home)
### RUN ONCE
#fulldata = read.csv2('USER_COURSE_VISUALISATION.csv', stringsAsFactors=FALSE)
#save(fulldata,file='fulldata.rdata')
#load('fulldata.rdata')
courseIds = unique(fulldata$course_id)
ncourses=length(courseIds)
for(i in 1:ncourses){
course_id = courseIds[i]

dir.create(file.path(home, course_id), showWarnings = FALSE)
setwd(paste(home,course_id,sep='/'))
 
#print(paste('Cours', i,'/',ncourses))
#setwd(paste(BaseURL,selectedCourse, sep='/'))
data = fulldata[which(fulldata$course_id==course_id),]
write.csv2(data,file='data.csv')
setwd(home)

}

alljsons = list.files(paste(home,'jsons',sep='/'))

################ BEGIN FOR
for(i in 1:length(alljsons)){
#print(paste('Cours structure', i,'/',length(alljsons)))
selectedCoursePath = paste(home,'jsons',sep='/')
setwd(selectedCoursePath)
jsonstructure <- fromJSON(alljsons[i])
  
courseId = jsonstructure$id


id_counter = 0;
structure = data.frame(id=id_counter, part_id=jsonstructure$id, parent_id=0,title=jsonstructure$title,type=jsonstructure$subtype,
                       slug=jsonstructure$slug, element_id=jsonstructure$elementId, course_id= courseId)

ntomes = nrow(jsonstructure$children)
if(ntomes>0)
for(t_counter in 1:ntomes){
 
  itome = as.data.frame(jsonstructure$children[t_counter,])
  tome.structure = data.frame(id=-99, part_id=itome$id, parent_id=structure[1,'part_id'],title=itome$title, type=itome$subtype,
                              slug=itome$slug, element_id=itome$elementId,course_id= courseId)
  structure = rbind(structure , tome.structure)
  
  chaps= as.data.frame(itome$children)
    nchaps =  nrow(chaps)
  if(nchaps>0)
  for(ch_counter in 1:nchaps){
    id_counter = id_counter + 1
    ichap =  as.data.frame(chaps[ch_counter,])
    chap.structure = data.frame(id=id_counter, part_id=ichap$id, parent_id=itome$id,title=ichap$title,type=ichap$subtype,
                                slug=ichap$slug, element_id=ichap$elementId,course_id= courseId)
    structure = rbind(structure , chap.structure)
    
    parts =  as.data.frame(ichap$children)
    npart = nrow(parts)
    
    if(npart>0)
    for(part_counter in 1:npart ){
      id_counter = id_counter + 1
      ipart =  as.data.frame(ichap$children)[part_counter,]
      part.structure = data.frame(id = id_counter, part_id=ipart$id, parent_id=ichap$id,title=ipart$title,type=ipart$subtype,
                                  slug='', element_id=ipart$elementId,course_id= courseId)
      structure = rbind(structure , part.structure)
    }
  }
  
}

setwd(home)
setwd(as.character(courseId))
cat(toJSON(jsonstructure), file="structure.json")
save(structure, file="structure.rdata")
setwd(home)

}############### END FOR
}

#####################################
#library('jsonlite')
#options(stringsAsFactors=FALSE)
#library('Rserve')
### STARTING
#Rserve(args='--vanilla')
### SHUTING
#require("RSclient")
#c <- RSconnect()
#RSshutdown(c)