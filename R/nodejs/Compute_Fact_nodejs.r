options(stringsAsFactors=FALSE)
library('jsonlite')
library('reshape')


selectedCourse='nodejs'
load(paste(selectedCourse,"rdata",sep="."))
load(paste(selectedCourse,"structure.rdata",sep="."))
load(paste(selectedCourse,"Interest.rdata",sep="."))
load(paste(selectedCourse,"Reads.rdata",sep="."))
load(paste(selectedCourse,"Ruptures.rdata",sep="."))
load(paste(selectedCourse,"RS.rdata",sep="."))
load(paste(selectedCourse,"partFollow.rdata",sep="."))
load(paste(selectedCourse,"achievement.rdata",sep="."))



structure = eval(parse(text = paste(selectedCourse,"structure",sep=".")))
names(structure)[1] = 'id'
Interest = eval(parse(text = paste(selectedCourse,"Interest",sep=".")))
Reads = eval(parse(text = paste(selectedCourse,"Reads",sep=".")))
Ruptures = eval(parse(text = paste(selectedCourse,"Ruptures",sep=".")))
RS = eval(parse(text = paste(selectedCourse,"RS",sep=".")))
partFollow=eval(parse(text = paste(selectedCourse,"partFollow",sep=".")))
data = eval(parse(text = paste(selectedCourse,sep=".")))
achievement = eval(parse(text = paste(selectedCourse,"achievement",sep=".")))

parts = unique(nodejs$part_id)
nparts = length(parts)
users = unique(nodejs$user_id)
nusers = length(users)
#################Prepare Transitions#####################
names(structure)[1]='part_index'
part_indexes=1:(max(structure$part_index))


Destinations_stats = data.frame(part_index=part_indexes,precedent=0,shifted_past=0,identity=0,next_p=0,shifted_next=0,total_back=0)
for(aPart in 1:max(structure$part_index))
{
  aPartDest = data.frame(part=1:(nrow(partFollow)), frequence=partFollow[aPart,])
  
  nodes_dest=aPartDest[which(aPartDest$frequence>median(aPartDest$frequence)),]
  nodes_dest$ratio = round(nodes_dest$frequence*100/sum(nodes_dest$frequence),0)
  
  if((aPart) %in% nodes_dest$part)
    Destinations_stats[which(Destinations_stats$part_index==aPart),]$identity =
    nodes_dest[nodes_dest$part==aPart,]$ratio
  
  if((aPart-1) %in% nodes_dest$part) 
    Destinations_stats[Destinations_stats$part_index==aPart,]$precedent = 
    nodes_dest[nodes_dest$part==aPart-1,]$ratio
  if((aPart+1) %in% nodes_dest$part) 
    Destinations_stats[Destinations_stats$part_index==aPart,]$next_p = nodes_dest[nodes_dest$part==aPart+1,]$ratio
  
  Destinations_stats[Destinations_stats$part_index==aPart,]$shifted_past = sum(nodes_dest[nodes_dest$part<aPart-1,]$ratio)
  Destinations_stats[Destinations_stats$part_index==aPart,]$shifted_next = sum(nodes_dest[nodes_dest$part>aPart+1,]$ratio)
  
  Destinations_stats[Destinations_stats$part_index==aPart,]$total_back = Destinations_stats[Destinations_stats$part_index==aPart,]$precedent + 
    Destinations_stats[Destinations_stats$part_index==aPart,]$shifted_past 
  
}

partPrecedent <- t(partFollow)
Provenances_stats = data.frame(part_index=part_indexes,precedent=0,shifted_past=0,identity=0,next_p=0,shifted_next=0,total_next=0)
for(aPart in 1:max(structure$part_index))
{
  aPartProv = data.frame(part=1:nrow(partPrecedent), frequence=partPrecedent[aPart,])
  
  nodes_prov=aPartProv[which(aPartProv$frequence>median(aPartProv$frequence)),]
  nodes_prov$ratio = round(nodes_prov$frequence*100/sum(nodes_prov$frequence),0)
  
  if((aPart) %in% nodes_prov$part)
    Provenances_stats[which(Provenances_stats$part_index==aPart),]$identity = nodes_prov[nodes_prov$part==aPart,]$ratio
  
  if((aPart-1) %in% nodes_prov$part) 
    Provenances_stats[Provenances_stats$part_index==aPart,]$precedent = nodes_prov[nodes_prov$part==aPart-1,]$ratio
  if((aPart+1) %in% nodes_prov$part) 
    Provenances_stats[Provenances_stats$part_index==aPart,]$next_p = nodes_prov[nodes_prov$part==aPart+1,]$ratio
  
  Provenances_stats[Provenances_stats$part_index==aPart,]$shifted_past = sum(nodes_prov[nodes_prov$part<aPart-1,]$ratio)
  Provenances_stats[Provenances_stats$part_index==aPart,]$shifted_next = sum(nodes_prov[nodes_prov$part>aPart+1,]$ratio)
  
  Provenances_stats[Provenances_stats$part_index==aPart,]$total_next = Provenances_stats[Provenances_stats$part_index==aPart,]$next_p + 
    Provenances_stats[Provenances_stats$part_index==aPart,]$shifted_next 
  
}


ProvenancesData = Provenances_stats[,-c(7)]
for(i in 1:nrow(ProvenancesData)){
  somme=sum(ProvenancesData[i,-c(1)])
  if(somme> 0)ProvenancesData[i,-c(1)] = round(ProvenancesData[i,-c(1)]*100/somme,0)
}

#################PartData#####################
PartData = structure
names(PartData)[1]=c('part_index')
nParties = nrow(PartData[which(PartData$part_index==0),])
PartData[which(PartData$part_index==0),]$part_index=-1*(0:(nParties-1))


PartData[which(PartData$type=='title-1'),]$type='partie'
PartData[which(PartData$type=='title-2'),]$type='chapitre'
PartData[which(PartData$type=='title-3'),]$type='section'

PartData = merge(PartData, Interest[,c(1,2,3,4,5)],all.x = TRUE)

names(PartData)[2]='part_index'
names(PartData)[3]='parent_id' 
names(PartData)[4]='part_title'
names(PartData)[5]='part_type'
PartData = merge(PartData, Reads[,-c(1)], all.x = TRUE)
PartData = merge(PartData, Ruptures[,-c(1)], all.x = TRUE)

names(Provenances_stats)=c("part_index","provenance_precedent","provenance_shifted_past", "provenance_identity","provenance_next_p","provenance_shifted_next","provenance_total_next")
names(Destinations_stats)=c("part_index","destination_precedent","destination_shifted_past", "destination_identity","destination_next_p","destination_shifted_next","destination_total_next") 
PartData = merge(PartData, Provenances_stats,  by = 'part_index',all.x = TRUE)
PartData = merge(PartData, Destinations_stats,  by = 'part_index',all.x = TRUE)
# Compute provenance/destination for chapters
chaptersIds = PartData[which(PartData$part_type=='chapitre'),]$part_id
for(i in 1:length(chaptersIds)){
  PartData[which(PartData$part_id==chaptersIds[i]),]$provenance_precedent =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$provenance_precedent)
  PartData[which(PartData$part_id==chaptersIds[i]),]$provenance_shifted_past =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$provenance_shifted_past)
  PartData[which(PartData$part_id==chaptersIds[i]),]$provenance_identity =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$provenance_identity)
  PartData[which(PartData$part_id==chaptersIds[i]),]$provenance_next_p =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$provenance_next_p)
  PartData[which(PartData$part_id==chaptersIds[i]),]$provenance_shifted_next =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$provenance_shifted_next)
  PartData[which(PartData$part_id==chaptersIds[i]),]$provenance_total_next =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$provenance_total_next)
  
  PartData[which(PartData$part_id==chaptersIds[i]),]$destination_precedent =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$destination_precedent)
  PartData[which(PartData$part_id==chaptersIds[i]),]$destination_shifted_past =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$destination_shifted_past)
  PartData[which(PartData$part_id==chaptersIds[i]),]$destination_identity =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$destination_identity)
  PartData[which(PartData$part_id==chaptersIds[i]),]$destination_next_p =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$destination_next_p)
  PartData[which(PartData$part_id==chaptersIds[i]),]$destination_shifted_next =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$destination_shifted_next)
  PartData[which(PartData$part_id==chaptersIds[i]),]$destination_total_next =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$destination_total_next)
}

tomesIds = PartData[which(PartData$part_type=='partie'),]$part_id
for(i in 1:length(chaptersIds)){
  PartData[which(PartData$part_id==chaptersIds[i]),]$provenance_precedent =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$provenance_precedent)
  PartData[which(PartData$part_id==chaptersIds[i]),]$provenance_shifted_past =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$provenance_shifted_past)
  PartData[which(PartData$part_id==chaptersIds[i]),]$provenance_identity =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$provenance_identity)
  PartData[which(PartData$part_id==chaptersIds[i]),]$provenance_next_p =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$provenance_next_p)
  PartData[which(PartData$part_id==chaptersIds[i]),]$provenance_shifted_next =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$provenance_shifted_next)
  PartData[which(PartData$part_id==chaptersIds[i]),]$provenance_total_next =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$provenance_total_next)
  
  PartData[which(PartData$part_id==chaptersIds[i]),]$destination_precedent =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$destination_precedent)
  PartData[which(PartData$part_id==chaptersIds[i]),]$destination_shifted_past =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$destination_shifted_past)
  PartData[which(PartData$part_id==chaptersIds[i]),]$destination_identity =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$destination_identity)
  PartData[which(PartData$part_id==chaptersIds[i]),]$destination_next_p =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$destination_next_p)
  PartData[which(PartData$part_id==chaptersIds[i]),]$destination_shifted_next =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$destination_shifted_next)
  PartData[which(PartData$part_id==chaptersIds[i]),]$destination_total_next =  mean(PartData[which(PartData$parent_id==chaptersIds[i]),]$destination_total_next)
}


tomesIds = PartData[which(PartData$part_type=='partie'),]$part_id
for(i in 1:length(tomesIds)){
  PartData[which(PartData$part_id==tomesIds[i]),]$provenance_precedent =  mean(PartData[which(PartData$parent_id==tomesIds[i]),]$provenance_precedent)
  PartData[which(PartData$part_id==tomesIds[i]),]$provenance_shifted_past =  mean(PartData[which(PartData$parent_id==tomesIds[i]),]$provenance_shifted_past)
  PartData[which(PartData$part_id==tomesIds[i]),]$provenance_identity =  mean(PartData[which(PartData$parent_id==tomesIds[i]),]$provenance_identity)
  PartData[which(PartData$part_id==tomesIds[i]),]$provenance_next_p =  mean(PartData[which(PartData$parent_id==tomesIds[i]),]$provenance_next_p)
  PartData[which(PartData$part_id==tomesIds[i]),]$provenance_shifted_next =  mean(PartData[which(PartData$parent_id==tomesIds[i]),]$provenance_shifted_next)
  PartData[which(PartData$part_id==tomesIds[i]),]$provenance_total_next =  mean(PartData[which(PartData$parent_id==tomesIds[i]),]$provenance_total_next)
  
  PartData[which(PartData$part_id==tomesIds[i]),]$destination_precedent =  mean(PartData[which(PartData$parent_id==tomesIds[i]),]$destination_precedent)
  PartData[which(PartData$part_id==tomesIds[i]),]$destination_shifted_past =  mean(PartData[which(PartData$parent_id==tomesIds[i]),]$destination_shifted_past)
  PartData[which(PartData$part_id==tomesIds[i]),]$destination_identity =  mean(PartData[which(PartData$parent_id==tomesIds[i]),]$destination_identity)
  PartData[which(PartData$part_id==tomesIds[i]),]$destination_next_p =  mean(PartData[which(PartData$parent_id==tomesIds[i]),]$destination_next_p)
  PartData[which(PartData$part_id==tomesIds[i]),]$destination_shifted_next =  mean(PartData[which(PartData$parent_id==tomesIds[i]),]$destination_shifted_next)
  PartData[which(PartData$part_id==tomesIds[i]),]$destination_total_next =  mean(PartData[which(PartData$parent_id==tomesIds[i]),]$destination_total_next)
}

# Compute duration for chapters and tomes
chaptersIds = PartData[which(PartData$part_type=='chapitre'),]$part_id
for(i in 1:length(chaptersIds)){
  PartData[which(PartData$part_id==chaptersIds[i]),]$max.duration =  sum(PartData[which(PartData$parent_id==chaptersIds[i]),]$max.duration)
  PartData[which(PartData$part_id==chaptersIds[i]),]$q1.duration =  sum(PartData[which(PartData$parent_id==chaptersIds[i]),]$q1.duration)
  PartData[which(PartData$part_id==chaptersIds[i]),]$q3.duration =  sum(PartData[which(PartData$parent_id==chaptersIds[i]),]$q3.duration)
  PartData[which(PartData$part_id==chaptersIds[i]),]$mean.duration =  sum(PartData[which(PartData$parent_id==chaptersIds[i]),]$mean.duration)
  PartData[which(PartData$part_id==chaptersIds[i]),]$median.duration =  sum(PartData[which(PartData$parent_id==chaptersIds[i]),]$median.duration)
}
tomesIds = PartData[which(PartData$part_type=='partie'),]$part_id
for(i in 1:length(tomesIds)){
  PartData[which(PartData$part_id==tomesIds[i]),]$max.duration =  sum(PartData[which(PartData$parent_id==tomesIds[i]),]$max.duration)
  PartData[which(PartData$part_id==tomesIds[i]),]$q1.duration =  sum(PartData[which(PartData$parent_id==tomesIds[i]),]$q1.duration)
  PartData[which(PartData$part_id==tomesIds[i]),]$q3.duration =  sum(PartData[which(PartData$parent_id==tomesIds[i]),]$q3.duration)
  PartData[which(PartData$part_id==tomesIds[i]),]$mean.duration =  sum(PartData[which(PartData$parent_id==tomesIds[i]),]$mean.duration)
  PartData[which(PartData$part_id==tomesIds[i]),]$median.duration =  sum(PartData[which(PartData$parent_id==tomesIds[i]),]$median.duration)
}

PartData$Readers_tx = round(PartData$Readers / nusers, 4)
PartData$RS_tx = round(PartData$RS_nb / nrow(nodejs.RS), 4)

PartData$Actions_tx = round(PartData$Actions_nb / nrow(nodejs), 4)
PartData$Readers_tx = round(PartData$Readers / nusers, 4)
allRup = max(PartData$rupture)
finalRupt = max(PartData$norecovery)
PartData$RS_tx = round(PartData$RS_nb /nrow(RS),4)
PartData$rupture_tx = round(PartData$rupture/allRup,4)
PartData$norecovery_tx = round(PartData$norecovery/finalRupt,4)
PartData$direct_recovery_tx= round(PartData$direct_recovery /PartData$recovery,4)
PartData$distant_next_recovery_tx= round(PartData$distant_next_recovery /PartData$recovery,4)
PartData$next_recovery_tx= round(PartData$next_recovery /PartData$recovery,4)
PartData$prev_recovery_tx= round(PartData$prev_recovery /PartData$recovery,4)
PartData$distant_prev_recovery_tx= round(PartData$distant_prev_recovery /PartData$recovery,4)

save(PartData, file='PartData.rdata')
colnames(PartData)[1]="id"
colnames(PartData)[3]="parent_id"

meltParts=melt(PartData, id.vars = 'id')
PartsData.json = toJSON(unname(split(meltParts,1:nrow(meltParts))))
cat(PartsData.json, file="structure.json")

#################Reading Facts#####################
FactDataPart = PartData[which(PartData$part_type=='section'),]

#### Visits
Interest_nbvisites_min = subset(FactDataPart, FactDataPart$Actions_tx<quantile(FactDataPart$Actions_tx,0.2,na.rm = TRUE), select=c(id,Actions_tx)) 
Interest_nbvisites_min$classe="Readings"
Interest_nbvisites_min$issueCode="RminVisit"
Interest_nbvisites_min$content="Trop peu de visites"
val = round(round(median(FactDataPart$Actions_tx,na.rm = TRUE),4)/ Interest_nbvisites_min$Actions_tx,2)
Interest_nbvisites_min$description=paste("cette section est visitée", val,"fois moins que le nombre médian de visites des autres parties.")
Interest_nbvisites_min$norm_value=round(median(FactDataPart$Actions_tx,na.rm = TRUE),2)
dif = 100 * abs(Interest_nbvisites_min$Actions_tx  - median(FactDataPart$Actions_tx,na.rm = TRUE))
Interest_nbvisites_min$gravity=round(5 * dif / median(FactDataPart$Actions_tx,na.rm = TRUE),0) 
Interest_nbvisites_min$suggestion_title="Revoir le titre et le contenu"
Interest_nbvisites_min$suggestion_content="Est-ce que le titre de la section résume bien son contenu ? 
Si oui :  Est-ce que cette section est  réellement intéressante par rapport au cours ? Si c'est le cas, peut-elle
être reformulée, voire intégrée ailleurs dans le cours ?  Sinon, la supprimer et revoir le plan du chapitre et du cours. 
Le cas échéant, il faudrait penser à le reformuler"



Interest_nbvisites_max = subset(FactDataPart, FactDataPart$Actions_tx>=quantile(FactDataPart$Actions_tx,0.9,na.rm = TRUE), select=c(id,Actions_tx)) 
Interest_nbvisites_max$classe="Readings"
Interest_nbvisites_max$issueCode="RVmaxVisit"
Interest_nbvisites_max$content="Beaucoup de visites"
val = round(Interest_nbvisites_max$Actions_tx/median(FactDataPart$Actions_tx,na.rm = TRUE),2)
Interest_nbvisites_max$description=paste("Cette section est visitée", val,"fois plus que le nombre médian de visites des autres parties.")
Interest_nbvisites_max$norm_value=round(median(FactDataPart$Actions_tx,na.rm = TRUE),2)
dif = 100 * abs(Interest_nbvisites_max$Actions_tx  - median(FactDataPart$Actions_tx,na.rm = TRUE))
Interest_nbvisites_max$gravity=round(5 * dif / median(FactDataPart$Actions_tx,na.rm = TRUE),0) 
Interest_nbvisites_max$suggestion_title=" "
Interest_nbvisites_max$suggestion_content=" "

#### Duration
Interest_duration_min = subset(FactDataPart, mean.duration<quantile(FactDataPart$mean.duration,0.2,na.rm = TRUE), select=c(id,mean.duration)) 
Interest_duration_min$classe="Readings"
Interest_duration_min$issueCode="RminDuration"
Interest_duration_min$content="Temps de lecture trop court"
val =0
Interest_duration_min$description=paste("La durée de visite sur cette section est relativement trop court :", round(Interest_duration_min$mean.duration / 60, 2)," minutes. La durée  médiane de lecture d'une partie est de: ",round(median(structure$mean.duration,na.rm = TRUE)/60 ,1) ,"minutes.")
Interest_duration_min$norm_value=round(median(FactDataPart$mean.duration,na.rm = TRUE),2)
dif = 100 * abs(Interest_duration_min$mean.duration  - median(FactDataPart$mean.duration,na.rm = TRUE))
Interest_duration_min$gravity=round(5 * dif / median(FactDataPart$mean.duration,na.rm = TRUE),0) 
Interest_duration_min$suggestion_title="Réviser ou supprimer la section"
Interest_duration_min$suggestion_content="la section doit apporter plus d'informations nouvelles / intéressantes : 
Si cet élément est réellement nécessaire : peut-il être reformulé, voire intégré dans un autre chapitre ou une autre partie du cours ?   Sinon, le supprimer et revoir le plan du chapitre et du cours."


Interest_duration_max = subset(FactDataPart, FactDataPart$mean.duration>quantile(FactDataPart$mean.duration,0.80,na.rm = TRUE) , select=c(id,mean.duration)) 
Interest_duration_max$classe="Readings"
Interest_duration_max$issueCode="RmaxDuration"
Interest_duration_max$content="Temps de lecture trop long"
val = 0
Interest_duration_max$description=paste("La durée de visite sur cette section est relativement très élevée:", round(Interest_duration_max$mean.duration / 60, 2)," minutes. La durée  médiane de lecture d'une partie est de: ",round(median(structure$mean.duration,na.rm = TRUE)/60 ,2) ,"minutes.")
Interest_duration_max$norm_value=round(median(FactDataPart$mean.duration,na.rm = TRUE),2)
dif = 0
Interest_duration_max$gravity=0
Interest_duration_max$suggestion_title="Réécrire la section"
Interest_duration_max$suggestion_content="La section doit être plus simple à  lire et à comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller à  l’essentiel"



#################Rereading Facts#####################

Rereads_rereadings_max = subset(FactDataPart, FactDataPart$rereadings_tx>quantile(FactDataPart$rereadings_tx,0.80,na.rm = TRUE) , select=c(id,rereadings_tx)) 
Rereads_rereadings_max$classe="Rereading"
Rereads_rereadings_max$issueCode="RRmax"
Rereads_rereadings_max$content="Trop de relectures"
val = 0
Rereads_rereadings_max$description=paste("Parmi toutes les lectures de la section, ",round(100*Rereads_rereadings_max$rereadings_tx, 2) ,"% sont des relectures. Le taux  médiane de relecture des autres sections est de: ",round(100*median(FactDataPart$rereadings_tx,na.rm = TRUE) ,2) ,"%.")
Rereads_rereadings_max$norm_value=0
dif = 0
Rereads_rereadings_max$gravity=0
Rereads_rereadings_max$suggestion_title="Simplifier l'écriture de la section et vérifier l'enchainement"
Rereads_rereadings_max$suggestion_content="la section doit être plus simple à  lire et à comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller ?  l’essentiel"




Rereads_rereaders_max = subset(FactDataPart, FactDataPart$part_readers_rereaders>quantile(FactDataPart$part_readers_rereaders,0.80,na.rm = TRUE) , select=c(id,part_readers_rereaders)) 
Rereads_rereaders_max$classe="Rereading"
Rereads_rereaders_max$issueCode="RerRmax"
Rereads_rereaders_max$content="Trop de relecteurs"
val = 0
Rereads_rereaders_max$description=paste("De tous les lecteurs de la section, ",round(100*Rereads_rereaders_max$part_readers_rereaders, 2) ,"% sont des relecteurs de cette même section. Le taux  médiane des lecteurs qui sont relecteurs des autres sections est de: ",round(100*median(FactDataPart$part_readers_rereaders,na.rm = TRUE) ,2) ,"%.")
Rereads_rereaders_max$norm_value=0
dif = 0
Rereads_rereaders_max$gravity=0
Rereads_rereaders_max$suggestion_title="Simplifier l'écriture de la section et vérifier l'enchainement"
Rereads_rereaders_max$suggestion_content="la section doit être plus simple à  lire et à comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller à  l’essentiel"

#################Transition Facts#####################
Transition_provenance_shiftednext = subset(FactDataPart, FactDataPart$provenance_shifted_next>20 & FactDataPart$id>1 , select=c(id,provenance_shifted_next)) 
Transition_provenance_shiftednext$classe="Transition"
Transition_provenance_shiftednext$issueCode="TransProvShiftNext"
Transition_provenance_shiftednext$content="Trop d\'arrivées depuis des sections suivantes"
val = 0
Transition_provenance_shiftednext$description=paste("Dans",Transition_provenance_shiftednext$provenance_shifted_next,"% des cas, la partie lue avant n’est pas celle qui précède mais est une partie située après")
Transition_provenance_shiftednext$norm_value=0
dif = 0
Transition_provenance_shiftednext$gravity=0
Transition_provenance_shiftednext$suggestion_title="Déplacer cette section ou l’englober dans une autre section ou chapitre"
Transition_provenance_shiftednext$suggestion_content="Cette section doit probablement être un pré-requis à la lecture d’autre(s) chapitre(s) ou section(s), n’y a t-il pas une restructuration du cours/chapitre/partie plus intéressante pour éviter ce phénomène ?"


Transition_provenance_shiftedpast = subset(FactDataPart, FactDataPart$provenance_shifted_past>20 , select=c(id,provenance_shifted_past)) 
Transition_provenance_shiftedpast$classe="Transition"
Transition_provenance_shiftedpast$issueCode="TransProvShiftPast"
Transition_provenance_shiftedpast$content="Trop d\'arrivées depuis des sections précédentes éloignées"
val = 0
Transition_provenance_shiftedpast$description=paste("Dans",Transition_provenance_shiftedpast$provenance_shifted_past,"% des cas, la partie lue avant n\'est pas celle qui précède mais une section précédente éloignée")
Transition_provenance_shiftedpast$norm_value=0
dif = 0
Transition_provenance_shiftedpast$gravity=0
Transition_provenance_shiftedpast$suggestion_title="Revoir la position de la section dans le plan du coirs"
Transition_provenance_shiftedpast$suggestion_content="Est-ce que cette section est bien positionnée dans le plan du chapitre et du cours ?"


Transition_Destination_shiftednext = subset(FactDataPart, FactDataPart$destination_shifted_next>20 , select=c(id,destination_shifted_next)) 
Transition_Destination_shiftednext$classe="Transition"
Transition_Destination_shiftednext$issueCode="TransDestShiftNext"
Transition_Destination_shiftednext$content="Trop de départ vers des sections suivantes éloignées"
val = 0
Transition_Destination_shiftednext$description=paste("Dans",Transition_Destination_shiftednext$destination_shifted_next,"% des cas, la partie lue après cette section n\'est pas pas directemen celle qui la suit mais est une partie située après")
Transition_Destination_shiftednext$norm_value=0
dif = 0
Transition_Destination_shiftednext$gravity=0
Transition_Destination_shiftednext$suggestion_title="Déplacer cette section ou l\'englober dans une autre section ou chapitre"
Transition_Destination_shiftednext$suggestion_content="Est-ce que cette section est bien positionnée dans le plan du cours ?
Est-ce que cette section et celles voisines qui la suivent sont réellement pertinentes  ?"


Transition_Destination_shiftedpast = subset(FactDataPart, FactDataPart$destination_shifted_past>20 & FactDataPart$id<max(FactDataPart$id), select=c(id,destination_shifted_past)) 
Transition_Destination_shiftedpast$classe="Transition"
Transition_Destination_shiftedpast$issueCode="TransDestShiftPast"
Transition_Destination_shiftedpast$content="Trop de départ vers des sections précédentes"
val = 0
Transition_Destination_shiftedpast$description=paste("Dans",Transition_Destination_shiftedpast$destination_shifted_past,"% des cas, la partie lue avant n\'est pas celle qui la suit mais une section précédente")
Transition_Destination_shiftedpast$norm_value=0
dif = 0
Transition_Destination_shiftedpast$gravity=0
Transition_Destination_shiftedpast$suggestion_title="Revoir la position de la section dans le plan du coirs"
Transition_Destination_shiftedpast$suggestion_content="Est-ce que cette section est bien positionnée dans le plan du chapitre et du cours ?"


#################Stop Facts#####################
Stop_stop_max = subset(FactDataPart, FactDataPart$rupture_tx >quantile(FactDataPart$rupture_tx,0.8,na.rm = TRUE) , select=c(id,rupture_tx)) 
Stop_stop_max$classe="Stop"
Stop_stop_max$issueCode="StopRSEnd"
Stop_stop_max$content="Trop de séances de lecture se terminent sur cette section"
val = 0
Stop_stop_max$description=paste(round(100*Stop_stop_max$rupture_tx,2),"% des séances de lecture se terminent sur cette section.")
Stop_stop_max$norm_value=0
dif = 0
Stop_stop_max$gravity=0
Stop_stop_max$suggestion_title="Réécrire et simplifier cette section"
Stop_stop_max$suggestion_content="Cette section a besoin d\'être plus simple à lire et à comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller à l\'essentiel"

Stop_final_stop = subset(FactDataPart, FactDataPart$norecovery_tx >quantile(FactDataPart$norecovery_tx,0.8,na.rm = TRUE) , select=c(id,norecovery_tx)) 
Stop_final_stop$classe="Stop"
Stop_final_stop$issueCode="StopRSExit"
Stop_final_stop$content="Trop d\'arrêts définitif de la lecture sur cette section"
val = 0
Stop_final_stop$description=paste(round(100*Stop_final_stop$norecovery_tx,2),"% des fins définitives de la lecture se font sur cette section.")
Stop_final_stop$norm_value=0
dif = 0
Stop_final_stop$gravity=0
Stop_final_stop$suggestion_title="Réécrire et simplifier cette section"
Stop_final_stop$suggestion_content="Cette section a besoin d\'être plus simple à lire et à comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller à l\'essentiel"

Stop_back_recovery = subset(FactDataPart, FactDataPart$distant_prev_recovery_tx >quantile(FactDataPart$distant_prev_recovery_tx,0.8,na.rm = TRUE) , select=c(id,distant_prev_recovery_tx)) 
Stop_back_recovery$classe="Stop"
Stop_back_recovery$issueCode="StopRecback"
Stop_back_recovery$content="Trop de de reprise sur des sections précédentes"
val = 0
Stop_back_recovery$description=paste(round(100*Stop_back_recovery$distant_prev_recovery_tx,2),"% des reprises de la lecture après arrêt sur cette section se font sur une section précédente.")
Stop_back_recovery$norm_value=0
dif = 0
Stop_back_recovery$gravity=0
Stop_back_recovery$suggestion_title="Revoir cette section et celles qui la précédent"
Stop_back_recovery$suggestion_content="Les élément précédents voisins de  cette section doivent probablement être des pré-requis importants pour continuer la lecture. Dans le cas contraire, Les élément précédents voisins de  cette section doivent peut-être être plus simple à lire/comprendre (cf. problèmes éventuels de relecture pour les éléments en question)."

Stop_next_recovery = subset(FactDataPart, FactDataPart$distant_next_recovery_tx >quantile(FactDataPart$distant_next_recovery_tx,0.8,na.rm = TRUE) , select=c(id,distant_next_recovery_tx)) 
Stop_next_recovery$classe="Stop"
Stop_next_recovery$issueCode="StopRecNext"
Stop_next_recovery$content="Trop de de reprise sur des des sections suivantes éloignées"
val = 0
Stop_next_recovery$description=paste(round(100*Stop_next_recovery$distant_next_recovery_tx,2),"% des reprises de la lecture après arrêt sur cette section se font sur une section suivante éloignée.")
Stop_next_recovery$norm_value=0
dif = 0
Stop_next_recovery$gravity=0
Stop_next_recovery$suggestion_title="Revoir cette section et celles voisines"
Stop_next_recovery$suggestion_content="Est-ce que cette section est bien positionnée dans le plan du cours ?
Est-ce que cette section  et celles voisines suivantes sont réellement pertinents ?"


####### SUM UP FACTS ########
names(Interest_nbvisites_vmin)[c(1,2)]=
  names(Interest_nbvisites_min)[c(1,2)]=
  names(Interest_nbvisites_max)[c(1,2)]=
  names(Interest_duration_min)[c(1,2)]=
  names(Interest_duration_max)[c(1,2)]=
  
  names(Rereads_rereadings_max)[c(1,2)]=
  names(Rereads_rereaders_max)[c(1,2)]=
  
  names(Transition_provenance_shiftednext)[c(1,2)]=
  names(Transition_provenance_shiftedpast)[c(1,2)]=
  #names(Transition_Destination_shiftednext)[c(1,2)]=
  names(Transition_Destination_shiftedpast)[c(1,2)]=
  
  names(Stop_stop_max)[c(1,2)]=
  names(Stop_final_stop)[c(1,2)]=
  names(Stop_back_recovery)[c(1,2)]=
  names(Stop_next_recovery)[c(1,2)]= c("id","value")


facts = 
  rbind(
    Interest_nbvisites_min,
    Interest_nbvisites_max,
    Interest_duration_min,
    Interest_duration_max,
    
    Rereads_rereadings_max,
    Rereads_rereaders_max,
    
    Transition_provenance_shiftednext,
    Transition_provenance_shiftedpast,
    #Transition_Destination_shiftednext,
    Transition_Destination_shiftedpast,
    
    Stop_stop_max,
    Stop_final_stop,
    Stop_back_recovery,
    Stop_next_recovery)

names(facts)[1]="part_index"
facts$part_index=as.numeric(facts$part_index)
save(facts, file="nodejs.facts.rdata")

names(facts)[1]='id'
facts.json = toJSON(unname(split(facts, 1:nrow(facts))))
cat(facts.json, file="facts.json")





View(PartData[which(PartData$part_type=='chapitre'),])
