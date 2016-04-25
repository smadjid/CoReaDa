options(stringsAsFactors=FALSE)

selectedCourse='nodejs'
setwd(paste('data',selectedCourse,sep="/"))
load(paste(selectedCourse,"rdata",sep="."))
load(paste(selectedCourse,"structure.rdata",sep="."))
load(paste(selectedCourse,"Interest.rdata",sep="."))
load(paste(selectedCourse,"Reads.rdata",sep="."))
load(paste(selectedCourse,"Ruptures.rdata",sep="."))
load(paste(selectedCourse,"RS.rdata",sep="."))
load(paste(selectedCourse,"partFollow.rdata",sep="."))
load(paste(selectedCourse,"chapFollow.rdata",sep="."))
load(paste(selectedCourse,"tomeFollow.rdata",sep="."))
load(paste(selectedCourse,"achievement.rdata",sep="."))

structure = eval(parse(text = paste(selectedCourse,"structure",sep=".")))
Interest = eval(parse(text = paste(selectedCourse,"Interest",sep=".")))
Reads = eval(parse(text = paste(selectedCourse,"Reads",sep=".")))
Ruptures = eval(parse(text = paste(selectedCourse,"Ruptures",sep=".")))
RS = eval(parse(text = paste(selectedCourse,"RS",sep=".")))
partFollow=eval(parse(text = paste(selectedCourse,"partFollow",sep=".")))
chapFollow=eval(parse(text = paste(selectedCourse,"chapFollow",sep=".")))
tomeFollow=eval(parse(text = paste(selectedCourse,"tomeFollow",sep=".")))
data = eval(parse(text = paste(selectedCourse,sep=".")))
achievement = eval(parse(text = paste(selectedCourse,"achievement",sep=".")))

################################# PARTDATA ########################################################
PartData = structure
nParties = nrow(PartData[which(PartData$part_index==0),])
PartData[which(PartData$part_index==0),]$part_index=-1*(0:(nParties-1))

PartData[which(PartData$type=='title-1'),]$type='partie'
PartData[which(PartData$type=='title-2'),]$type='chapitre'
PartData[which(PartData$type=='title-3'),]$type='section'


#################### Récupération de la taille #################### 

chaptersIds = PartData[which(PartData$type=='chapitre'),]$part_id
for(i in 1:length(chaptersIds)){
  PartData[which(PartData$part_id==chaptersIds[i]),]$size = PartData[which(PartData$part_id==chaptersIds[i]),]$size +
    sum(PartData[which(PartData$parent_id==chaptersIds[i]),]$size)
  
}

tomesIds = PartData[which(PartData$type=='partie'),]$part_id
for(i in 1:length(chaptersIds)){
  PartData[which(PartData$part_id==chaptersIds[i]),]$size =  sum(PartData[which(PartData$parent_id==chaptersIds[i]),]$size)
  
}

PartData$speed=round(PartData$size/(PartData$mean.duration/60),2)
save(PartData, file='PartData.rdata')
####################FIN####################
 
load('PartData.rdata')

PartData = merge(PartData, Reads[,-c(1)], all.x = TRUE)
PartData = merge(PartData, Ruptures[,-c(1)], all.x = TRUE)

PartData$Readers_tx = round(PartData$Readers / nusers, 4)
PartData$Actions_tx = round(PartData$Actions_nb / nrow(nodejs), 4)
PartData$Readers_tx = round(PartData$Readers / nusers, 4)
allRup = max(PartData$rupture)
finalRupt = max(PartData$norecovery)

PartData$rupture_tx = round(PartData$rupture/allRup,4)
PartData$norecovery_tx = round(PartData$norecovery/finalRupt,4)
PartData$direct_recovery_tx= round(PartData$direct_recovery /PartData$recovery,4)
PartData$distant_next_recovery_tx= round(PartData$distant_next_recovery /PartData$recovery,4)
PartData$next_recovery_tx= round(PartData$next_recovery /PartData$recovery,4)
PartData$prev_recovery_tx= round(PartData$prev_recovery /PartData$recovery,4)
PartData$distant_prev_recovery_tx= round(PartData$distant_prev_recovery /PartData$recovery,4)

PartData$rereads_tx = 0
s = s = sum(PartData[which(PartData$type=='section'),]$Rereadings)
PartData[which(PartData$type=='section'),]$rereads_tx =  100 * round(PartData[which(PartData$type=='section'),]$Rereadings / sum(PartData[which(PartData$type=='section'),]$Rereadings),2)
# for chapters
chaptersIds = PartData[which(PartData$type=='chapitre'),]$part_id
for(i in 1:length(chaptersIds)){
  PartData[which(PartData$part_id==chaptersIds[i]),]$rereads_tx =  sum(PartData[which(PartData$parent_id==chaptersIds[i]),]$rereads_tx)
}



save(PartData, file='PartData.rdata')
PartData=PartData[,c("part_index","part_id","parent_id","title",
  "type"              ,       "slug"                    ,
 "max.duration"        ,     "mean.duration"           ,
  "median.duration"    ,      "q1.duration"             ,
 "q3.duration"         ,     "chap_index"              ,
"tome_index"           ,    "size"                    ,
 "speed"               ,     "Actions_nb"              ,
"Readers"              ,    "Rereaders"               ,
"Readings"              ,   "Rereadings"              ,
 "Sequential_rereadings" ,   "Decaled_rereadings"      ,
 "rereadings_tx"         ,   "part_readers_rereaders"  ,
 "course_readers_rereaders", "rereads_seq_tx"          ,
 "rereads_dec_tx"         ,  "rupture"                 ,
 "recovery"              ,   "norecovery"              ,
"direct_recovery"       ,   "distant_next_recovery"   ,
"next_recovery"        ,    "prev_recovery"           ,
"distant_prev_recovery" ,   "Readers_tx"              ,
 "Actions_tx"            ,   "rupture_tx"              ,
 "norecovery_tx"          ,  "direct_recovery_tx"      ,
 "distant_next_recovery_tx", "next_recovery_tx"        ,
 "prev_recovery_tx"         ,"distant_prev_recovery_tx",
 "rereads_tx"  

)]

colnames(PartData)[1]="id"


meltParts=melt(PartData, id.vars = 'id')
PartsData.json = toJSON(unname(split(meltParts,1:nrow(meltParts))))
cat(PartsData.json, file="structure.json")
  
 
  
  ####### NOMBRE DE VISITES TROP PEU
  
  InterestData = PartData[which(PartData$type=='section'),]
  
  byParts = subset(InterestData, InterestData$Actions_tx<quantile(InterestData$Actions_tx,0.10,na.rm = TRUE), select=c('part_id','Actions_tx'))  
  byParts$classe="Actions_tx"
  byParts$issueCode="RminVisit"
  byParts$content="Trop peu de visites"
  byParts$delta = median(InterestData$Actions_tx,na.rm = TRUE) - byParts$Actions_tx
    val = round(median(InterestData$Actions_tx,na.rm = TRUE)/ byParts$Actions_tx,2)
  byParts$description=paste("Cette section est visitée", val,"fois moins que le nombre moyen de visites des autres sections")
  byParts$suggestion_title="Revoir le titre et le contenu"
  byParts$suggestion_content="Est-ce que le titre de la section résume bien son contenu ? 
Si oui :  Est-ce que cette section est  réellement intéressante par rapport au cours ? Si c'est le cas, peut-elle
être reformulée, voire intégrée ailleurs dans le cours ?  Sinon, la supprimer et revoir le plan du chapitre et du cours. 
  Le cas échéant, il faudrait penser à le reformuler"
  
InterestData = PartData[which(PartData$type=='chapitre'),]
  byChaps = subset(InterestData, InterestData$Actions_tx<quantile(InterestData$Actions_tx,0.10,na.rm = TRUE), select=c('part_id','Actions_tx'))  
  byChaps$classe="Actions_tx"
  byChaps$issueCode="RminVisit"
  byChaps$content="Trop peu de visites"
  byChaps$delta  = median(InterestData$Actions_tx,na.rm = TRUE)- byChaps$Actions_tx
    val = round(median(InterestData$Actions_tx,na.rm = TRUE)/ byChaps$Actions_tx,2)
  byChaps$description=paste("Ce chapitre est visité", val,"fois moins que le nombre médian de visites des autres chapitres")
  byChaps$suggestion_title="Revoir le titre et le contenu"
  byChaps$suggestion_content="Est-ce que le titre du chapitre  résume bien son contenu ? 
Si oui :  Est-ce que ce chapitre est  réellement intéressant par rapport au cours ? Si c'est le cas, peut-il
être reformulé, voire intégré ailleurs dans le cours ?  Sinon, la supprimer et revoir le plan de la partie chapitre et du cours. 
  Le cas échéant, il faudrait penser à le reformuler"
  
  
  
  minVisits = rbind(byParts,byChaps)
  
  
  ####### DUREE MIN
 #NO DUration
  DurationData = PartData[which(PartData$type=='section'),c('part_id','mean.duration')]
  
  byParts = DurationData[which(DurationData$mean.duration<quantile(DurationData$mean.duration,0.10,na.rm = TRUE) ),]
  byParts$classe="mean.duration"
  byParts$issueCode="RminDuration"
  byParts$content="Temps de lecture trop court"
  val = round(median(DurationData$mean.duration,na.rm = TRUE) / byParts$mean.duration,0)
  byParts$description=paste("Cette section est plutôt survolée : son temps de lecture est",val,"fois inférieur au temps médian")
  byParts$suggestion_title="Réviser ou supprimer la section"
  byParts$suggestion_content="La section doit apporter plus d'informations nouvelles / intéressantes : 
  Si cette section est réellement nécessaire : peut-elle être reformulée, voire intégrée dans un autre chapitre ou une autre section du cours ?
  Sinon, la supprimer et revoir le plan du chapitre et du cours."
  
  DurationData = PartData[which(PartData$type=='chapitre'),c('part_id','mean.duration')]

  byChaps = DurationData[which(DurationData$mean.duration<quantile(DurationData$mean.duration,0.10,na.rm = TRUE) ),]
  byChaps$classe="mean.duration"
  byChaps$issueCode="RminDuration"
  byChaps$content="Temps de lecture trop court"
  val = round(median(DurationData$mean.duration,na.rm = TRUE) / byChaps$mean.duration,0)
  byChaps$description=paste("Ce chapitre est plutôt survolé : son temps de lecture est",val,"fois inférieur au temps médian")
  byChaps$suggestion_title="Réviser ou supprimer le chapitre"
  byChaps$suggestion_content="Le chapitre doit apporter plus d'informations nouvelles / intéressantes : 
  Si  le chapitre est réellement nécessaire : peut-il être reformulé, voire intégré dans un autre chapitre ou  partie du cours ?
  Sinon, le supprimer et revoir le plan de la partie chapitre et du cours."
  
DurationData = PartData[which(PartData$type=='partie'),c('part_id','mean.duration')]
  
  byTomes = DurationData[which(DurationData$mean.duration<quantile(DurationData$mean.duration,0.10,na.rm = TRUE) ),]
  byTomes$classe="mean.duration"
  byTomes$issueCode="RminDuration"
  byTomes$content="Temps de lecture trop court"
  val = round(median(DurationData$mean.duration,na.rm = TRUE) / byTomes$mean.duration,0)
  byTomes$description=paste("Cette partie est plutôt survolée : son temps de lecture est",val,"fois inférieur au temps médian")
  byTomes$suggestion_title="Réviser ou supprimer la partie"
  byTomes$suggestion_content="La partie doit apporter plus d'informations nouvelles / intéressantes : 
  Si la partie est réellement nécessaire : peut-elle être reformulée, voire intégrée dans une partie du cours ?
  Sinon, la supprimer et revoir le plan du cours."
  
  
  minDuration =  rbind(byParts,byChaps,byTomes)
  
################## Vitesse MAX
  
  SpeedData = PartData[which(PartData$type=='section'),c('part_id','speed')]
  
  byParts = SpeedData[which(SpeedData$speed>quantile(SpeedData$speed,0.90,na.rm = TRUE) ),]
  byParts$classe="speed"
  byParts$issueCode="RmaxSpeed"
  byParts$content="Lecture trop rapide"
  byParts$delta = byParts$speed - median(SpeedData$speed,na.rm = TRUE)
    val = round(byParts$speed / median(SpeedData$speed,na.rm = TRUE) ,2)
  byParts$description=paste("Cette section comporte probablement trop peu d'éléments nouveaux, intéressants : la vitesse moyenne de lecture étant", val,"fois supéreiure à la vitesse moyenne de lecture des autres section")
  byParts$suggestion_title="Réviser ou supprimer la section"
  byParts$suggestion_content="La section doit être plus simple à lire/comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller à l'essentiel"
  
  SpeedData = PartData[which(PartData$type=='chapitre'),c('part_id','speed')]
  byChaps = SpeedData[which(SpeedData$speed>quantile(SpeedData$speed,0.90,na.rm = TRUE) ),]
  byChaps$classe="speed"
  byChaps$issueCode="RmaxSpeed"
  byChaps$content="Lecture trop rapide"
  byChaps$delta = byChaps$speed - median(SpeedData$speed,na.rm = TRUE) 
    val = round(byChaps$speed / median(SpeedData$speed,na.rm = TRUE) ,2)
  byChaps$description=paste("Ce chapitre  comporte probablement trop peu d'éléments nouveaux, intéressants : la vitesse moyenne de lecture étant",val,"fois supéreire à la vitesse moyenne de lecture des autres chapitres")
  byChaps$suggestion_title="Réviser ou supprimer le chapitre"
  byChaps$suggestion_content="Le chapitre doit être plus simple à lire/comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller à l'essentiel."
  
  minSpeed =  rbind(byParts,byChaps)
  
  ################## Vitesse MIN
  
  SpeedData = PartData[which(PartData$type=='section'),c('part_id','speed')]
  
  byParts = SpeedData[which(SpeedData$speed<quantile(SpeedData$speed,0.10,na.rm = TRUE) ),]
  byParts$classe="speed"
  byParts$issueCode="RminSpeed"
  byParts$content="Lecture trop lente"
  byParts$delta = median(SpeedData$speed,na.rm = TRUE) - byParts$speed 
    val = round(median(SpeedData$speed,na.rm = TRUE) /byParts$speed  ,2)
  byParts$description=paste("Cette section est probablement trop longue ou contient beaucoup de notions complexes ou nouvelles, sa vitesse moyenne de lecture étant", val,"fois inférieure à la vitesse moyenne de lecture des autres section")
  byParts$suggestion_title="Réviser la section"
  byParts$suggestion_content="La section doit être plus simple à lire/comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller à l'essentiel"
  
  SpeedData = PartData[which(PartData$type=='chapitre'),c('part_id','speed')]
  byChaps = SpeedData[which(SpeedData$speed<quantile(SpeedData$speed,0.10,na.rm = TRUE) ),]
  byChaps$classe="speed"
  byChaps$issueCode="RminSpeed"
  byChaps$content="Lecture trop rapide"
  byChaps$delta = median(SpeedData$speed,na.rm = TRUE) /byChaps$speed
    val = round(median(SpeedData$speed,na.rm = TRUE) /byChaps$speed  ,2)
  byChaps$description=paste("Cette section est probablement trop longue ou contient beaucoup de notions complexes ou nouvelles, sa vitesse moyenne de lecture étant", val,"fois inférieure à la vitesse moyenne de lecture des autres section")
  byChaps$suggestion_title="Réviser le chapitre"
  byChaps$suggestion_content="Le chapitre doit être plus simple à lire/comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller à l'essentiel."
  
  maxSpeed =  rbind(byParts,byChaps)
  
####### MAX REREADINGS

ReadsData  = PartData[which(PartData$type=='section'),c('part_id','rereadings_tx')]
byParts = ReadsData[which(ReadsData$rereadings_tx>quantile(ReadsData$rereadings_tx,0.9,na.rm = TRUE)),]
byParts$classe="rereadings_tx"
byParts$issueCode="RRmax"
byParts$content="Trop de relectures"
byParts$delta=byParts$rereadings_tx-median(ReadsData$rereadings_tx)
  val = round(byParts$rereadings_tx/median(ReadsData$rereadings_tx),2)
byParts$description=paste("Cette section est  en moyenne relue",val ,"fois plus que le nombre moyen de relecture des autres sections")
byParts$suggestion_title="Simplifier l'écriture de la section et vérifier l'enchainement"
byParts$suggestion_content="La section doit être plus simple à  lire et comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller à l'essentiel.
Sinon, regarder l'indicateur de relecture plus spécifique (même séance ou séances disjointes) pour suggestion"

ReadsData  = PartData[which(PartData$type=='chapitre'),c('part_id','rereadings_tx')]
byChaps = ReadsData[which(ReadsData$rereadings_tx>quantile(ReadsData$rereadings_tx,0.9,na.rm = TRUE)),]
byChaps$classe="rereadings_tx"
byChaps$issueCode="RRmax"
byChaps$content="Trop de relectures"
byChaps$delta=byChaps$rereadings_tx-median(ReadsData$rereadings_tx)
  val = round(byChaps$rereadings_tx/median(ReadsData$rereadings_tx),2)
byChaps$description=paste("Les sections de ce chapitre sont en moyenne relues",val,"fois plus que le nombre moyen de relectures des sections des autres chapitres")
byChaps$suggestion_title="Simplifier l'écriture du chapitre et vérifier l'enchainement des sections"
byChaps$suggestion_content="Le chapitre et ses sections doivent être plus simples à  lire et comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller à  l'essentiel.
Sinon, regarder l'indicateur de relecture plus spécifique (même séance ou séances disjointes) pour suggestion"


maxRereadings =  rbind(byParts,byChaps)#,byTomes)

# arrets définitif de la lecture
StopData = PartData[which(PartData$type=='section'),c('part_id','norecovery_tx')]
byParts = StopData[which(StopData$norecovery_tx>quantile(StopData$norecovery_tx,0.9,na.rm = TRUE)),]
byParts$classe="norecovery_tx"
byParts$issueCode="StopRSExit"
byParts$delta=byParts$norecovery_tx - median(StopData$norecovery_tx)
  val = round(100*byParts$norecovery_tx,2)
byParts$content=paste("Trop d'arrêts définitifs de la lecture sur cette section")
byParts$description=paste(val, "% des fins définitives de la lecture  (sans reprises ultérieures) se passent sur cette section. ")
byParts$suggestion_title="Réécrire et simplifier cette section"
byParts$suggestion_content="Cette section a besoin d\'être plus simple à lire et à comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller à l\'essentiel"


StopData = PartData[which(PartData$type=='chapitre'),c('part_id','norecovery_tx')]
byChaps = StopData[which(StopData$norecovery_tx>quantile(StopData$norecovery_tx,0.9,na.rm = TRUE)),]
byChaps$classe="norecovery_tx"
byChaps$issueCode="StopRSExit"
byChaps$content=paste("Trop d'arrêts définitifs de la lecture sur ce chapitre")
byChaps$delta=byChaps$norecovery_tx - median(StopData$norecovery_tx)
  val = round(100*byChaps$norecovery_tx,2)
byChaps$description=paste(val, "% des fins définitives de la lecture  (sans reprises ultérieures) se passent sur ce chapitre.")
byChaps$suggestion_title="Réécrire et simplifier ce chapitre"
byChaps$suggestion_content="Ce chapitre a besoin d\'être plus simple à lire et à comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller à l\'essentiel"



maxFinalStops =  rbind(byParts,byChaps)#,byTomes)  



names(minVisits)[c(1,2)]=
  names(minSpeed)[c(1,2)]=
  names(maxRereadings)[c(1,2)]=
  names(maxSpeed)[c(1,2)]=
  names(maxFinalStops)[c(1,2)]=c("part_id","value")

facts = 
  rbind(
    minVisits,
    minSpeed,
    maxSpeed,
    maxRereadings,
    maxFinalStops)

save(facts, file="nodejs.facts.rdata")


library('jsonlite')
library('reshape')


facts.json = toJSON(unname(split(facts, 1:nrow(facts))))
cat(facts.json, file="facts.json")



############################################################################################""











####### DUREE MAX
  DurationData = structure[which(structure$type=='title-3'),c('part_id','mean.duration')]
  
  byParts = DurationData[which(DurationData$mean.duration>quantile(DurationData$mean.duration,0.9,na.rm = TRUE)),]
  byParts$classe="Readings"
  byParts$issueCode="RmaxDuration"
  byParts$content="Temps de lecture trop long"
  byParts$description=paste("La durée de visite sur cette section est relativement très élevée:",byParts$mean.duration,
                            "secondes. La durée  médiane de lecture d'une section est de: ",round(median(structure$mean.duration,na.rm = TRUE) ,1) ,"secondes.")
  byParts$suggestion_title="Réécrire la section"
  byParts$suggestion_content="la section doit être plus simple ?  lire/comprendre : 
  - utiliser un vocabulaire plus commun ou directement défini dans le texte, 
  - vérifier l'enchaînement logique des propos
  - ajouter des exemples/analogies pour améliorer la compréhension
  - éviter les dispersions : aller à l'essentiel"
  
  DurationData = structure[which(structure$type=='title-2'),c('part_id','mean.duration')]
  
  byChaps = DurationData[which(DurationData$mean.duration>quantile(DurationData$mean.duration,0.9,na.rm = TRUE)),]
  byChaps$classe="Readings"
  byChaps$issueCode="RmaxDuration"
  byChaps$content="Temps de lecture trop long"
  byChaps$description=paste("La durée de visite sur ce chapitre est relativement très élevée:",byChaps$mean.duration,
                            "secondes. La durée  médiane de lecture d'un chapitre est de: ",round(median(structure$mean.duration,na.rm = TRUE) ,1) ,"secondes.")
  byChaps$suggestion_title="Réécrire ce chapitre"
  byChaps$suggestion_content="ce chapitre doit être plus simple à  lire/comprendre : 
  - utiliser un vocabulaire plus commun ou directement défini dans le texte, 
  - vérifier l'enchaînement logique des propos
  - ajouter des exemples/analogies pour améliorer la compréhension
  - éviter les dispersions : aller à l'essentiel"
  
  DurationData = structure[which(structure$type=='title-1'),c('part_id','mean.duration')]
  
  byTomes = DurationData[which(DurationData$mean.duration>quantile(DurationData$mean.duration,0.9,na.rm = TRUE)),]
  byTomes$classe="Readings"
  byTomes$issueCode="RmaxDuration"
  byTomes$content="Temps de lecture trop long"
  byTomes$description=paste("La durée de visite sur cette partie est relativement très élevée:",byTomes$mean.duration,
                            "secondes. La durée  médiane de lecture d'une partie est de: ",round(median(structure$mean.duration,na.rm = TRUE) ,1) ,"secondes.")
  byTomes$suggestion_title="Réécrire cette partie"
  byTomes$suggestion_content="cette partie doit être plus simple à  lire/comprendre : 
  - utiliser un vocabulaire plus commun ou directement défini dans le texte, 
  - vérifier l'enchaînement logique des propos
  - ajouter des exemples/analogies pour améliorer la compréhension
  - éviter les dispersions : aller à l'essentiel"
  
  maxDuration =  rbind(byParts,byChaps,byTomes)
 
  
  ############################################# II. RELECTURE ################################################
  
  ####### MAX REREADERS
  Reads$Rereaders = as.numeric(Reads$Rereaders) 
  ReadsData = Reads[which(Reads$type=='title-3'),c('part_id','Readers','Rereaders')]
  
  ReadsData$rereads_tx =  100 * round(ReadsData$Rereaders / ReadsData$Readers,2)
  
  byParts = ReadsData[which(ReadsData$rereads_tx>40),c('part_id','rereads_tx')]
  byParts$classe="Rereading"
  byParts$issueCode="RRermax"
  byParts$content="Trop de lecteurs qui sont relecteurs"
  byParts$description=paste(byParts$rereads_tx,"% des lecteurs de cette section la relisent au moins une fois.")
  byParts$suggestion_title="Simplifier l'écriture de la section et vérifier l'enchainement"
  byParts$suggestion_content="La section doit être plus simple à  lire et comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller à l'essentiel."

  
  ReadsData = Reads[which(Reads$type=='title-2'),c('part_id','Readers','Rereaders')]
  ReadsData$rereads_tx =  100 * round(ReadsData$Rereaders / ReadsData$Readers,2)
  
  byChaps = ReadsData[which(ReadsData$rereads_tx>35),c('part_id','rereads_tx')]
  byChaps$classe="Rereading"
  byChaps$issueCode="RRermax"
  byChaps$content="Trop de lecteurs qui sont relecteurs"
  byChaps$description=paste(byChaps$rereads_tx,"% des lecteurs des sections de ce chapitre relisent des sections déja lues")
  byChaps$suggestion_title="Simplifier l'écriture du chapitre et de ses  section et vérifier l'enchainement"
  byChaps$suggestion_content="Le chapitre et ses sections doivent être plus simples à  lire et comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller à l'essentiel."

  ReadsData = Reads[which(Reads$type=='title-1'),c('part_id','Readers','Rereaders')]
  ReadsData$rereads_tx =  100 * round(ReadsData$Rereaders / ReadsData$Readers,2)
  
  byTomes = ReadsData[which(ReadsData$rereads_tx>35),c('part_id','rereads_tx')]
  byTomes$classe="Rereading"
  byTomes$issueCode="RRermax"
  byTomes$content="Trop de lecteurs qui sont relecteurs"
  byTomes$description=paste(byTomes$rereads_tx,"% des lecteurs des sections de cette partie  relisent des sections déja lues")
  byTomes$suggestion_title="Simplifier l'écriture de la partie, ses chapitres et ses  section et vérifier l'enchainement"
  byTomes$suggestion_content="La partie, ses chapitres et ses sections doivent être plus simples à  lire et comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller à l'essentiel."
  
  maxRereaders =  rbind(byParts,byChaps,byTomes)
  
  
  ############################################# III. NAVIGATION ################################################
  # Sections :
  part_indexes=1:(max(structure$part_index))
  
  Parts_destinations_stats = data.frame(part_index=part_indexes,precedent=0,shifted_past=0,next_p=0,shifted_next=0,total_back=0)
  
  for(aPart in 1:max(structure$part_index))
  {
    aPartDest = data.frame(part=1:(nrow(partFollow)), frequence=partFollow[aPart,])
    
    nodes_dest=aPartDest
    nodes_dest$ratio = round(nodes_dest$frequence*100/sum(nodes_dest$frequence),0)
    
   
    if((aPart-1) %in% nodes_dest$part) 
      Parts_destinations_stats[Parts_destinations_stats$part_index==aPart,]$precedent = 
      nodes_dest[nodes_dest$part==aPart-1,]$ratio
    if((aPart+1) %in% nodes_dest$part) 
      Parts_destinations_stats[Parts_destinations_stats$part_index==aPart,]$next_p = nodes_dest[nodes_dest$part==aPart+1,]$ratio
    
    Parts_destinations_stats[Parts_destinations_stats$part_index==aPart,]$shifted_past = sum(nodes_dest[nodes_dest$part<aPart-1,]$ratio)
    Parts_destinations_stats[Parts_destinations_stats$part_index==aPart,]$shifted_next = sum(nodes_dest[nodes_dest$part>aPart+1,]$ratio)
    
    Parts_destinations_stats[Parts_destinations_stats$part_index==aPart,]$total_back = Parts_destinations_stats[Parts_destinations_stats$part_index==aPart,]$precedent + 
      Parts_destinations_stats[Parts_destinations_stats$part_index==aPart,]$shifted_past 
    
  }
  
  partPrecedent <- t(partFollow)
  Parts_provenances_stats = data.frame(part_index=part_indexes,precedent=0,shifted_past=0,next_p=0,shifted_next=0,total_next=0)
  for(aPart in 1:max(structure$part_index))
  {
    aPartProv = data.frame(part=1:nrow(partPrecedent), frequence=partPrecedent[aPart,])
    
    nodes_prov=aPartProv
    nodes_prov$ratio = round(nodes_prov$frequence*100/sum(nodes_prov$frequence),0)
    
   
    if((aPart-1) %in% nodes_prov$part) 
      Parts_provenances_stats[Parts_provenances_stats$part_index==aPart,]$precedent = nodes_prov[nodes_prov$part==aPart-1,]$ratio
    if((aPart+1) %in% nodes_prov$part) 
      Parts_provenances_stats[Parts_provenances_stats$part_index==aPart,]$next_p = nodes_prov[nodes_prov$part==aPart+1,]$ratio
    
    Parts_provenances_stats[Parts_provenances_stats$part_index==aPart,]$shifted_past = sum(nodes_prov[nodes_prov$part<aPart-1,]$ratio)
    Parts_provenances_stats[Parts_provenances_stats$part_index==aPart,]$shifted_next = sum(nodes_prov[nodes_prov$part>aPart+1,]$ratio)
    
    Parts_provenances_stats[Parts_provenances_stats$part_index==aPart,]$total_next = Parts_provenances_stats[Parts_provenances_stats$part_index==aPart,]$next_p + 
      Parts_provenances_stats[Parts_provenances_stats$part_index==aPart,]$shifted_next 
    
  }
  
  PartsProvenancesData =merge(Parts_provenances_stats[,-c(7)], structure[,c('part_index','part_id')])
  for(i in 1:nrow(PartsProvenancesData)){
    somme=sum(PartsProvenancesData[i,-c(1)])
    if(somme> 0)PartsProvenancesData[i,-c(1)] = round(PartsProvenancesData[i,-c(1)]*100/somme,0)
  }
  
  #chapters
  chap_indexes=1:(max(structure$chap_index,na.rm=TRUE))
  
  Chaps_destinations_stats = data.frame(chap_index=chap_indexes,precedent=0,shifted_past=0,identity=0,next_p=0,shifted_next=0,total_back=0)
  for(aChap in 1:max(chap_indexes))
  {
    aChapDest = data.frame(chap=1:(nrow(chapFollow)), frequence=chapFollow[aChap,])
    aChapDest = aChapDest[which(aChapDest$chap!=aChap),]
    
    nodes_dest=aChapDest
    nodes_dest$ratio = round(nodes_dest$frequence*100/sum(nodes_dest$frequence),0)
    
    
    
    if((aChap-1) %in% nodes_dest$chap) 
      Chaps_destinations_stats[Chaps_destinations_stats$chap_index==aChap,]$precedent = 
      nodes_dest[nodes_dest$chap==aChap-1,]$ratio
    if((aChap+1) %in% nodes_dest$chap) 
      Chaps_destinations_stats[Chaps_destinations_stats$chap_index==aChap,]$next_p = nodes_dest[nodes_dest$chap==aChap+1,]$ratio
    
    Chaps_destinations_stats[Chaps_destinations_stats$chap_index==aChap,]$shifted_past = sum(nodes_dest[nodes_dest$chap<aChap-1,]$ratio)
    Chaps_destinations_stats[Chaps_destinations_stats$chap_index==aChap,]$shifted_next = sum(nodes_dest[nodes_dest$chap>aChap+1,]$ratio)
    
    Chaps_destinations_stats[Chaps_destinations_stats$chap_index==aChap,]$total_back = Chaps_destinations_stats[Chaps_destinations_stats$chap_index==aChap,]$precedent + 
      Chaps_destinations_stats[Chaps_destinations_stats$chap_index==aChap,]$shifted_past 
    
  }
  
  chapPrecedent <- t(chapFollow)
  Chaps_provenances_stats = data.frame(chap_index=chap_indexes,precedent=0,shifted_past=0,identity=0,next_p=0,shifted_next=0,total_next=0)
  for(aChap in 1:max(chap_indexes))
  {
    aChapProv = data.frame(chap=1:nrow(chapPrecedent), frequence=chapPrecedent[aChap,])
    aChapProv = aChapProv[which(aChapProv$chap!=aChap),]
    
    nodes_prov=aChapProv
    nodes_prov$ratio = round(nodes_prov$frequence*100/sum(nodes_prov$frequence),0)
    
   
    
    if((aChap-1) %in% nodes_prov$chap) 
      Chaps_provenances_stats[Chaps_provenances_stats$chap_index==aChap,]$precedent = nodes_prov[nodes_prov$chap==aChap-1,]$ratio
    if((aChap+1) %in% nodes_prov$chap) 
      Chaps_provenances_stats[Chaps_provenances_stats$chap_index==aChap,]$next_p = nodes_prov[nodes_prov$chap==aChap+1,]$ratio
    
    Chaps_provenances_stats[Chaps_provenances_stats$chap_index==aChap,]$shifted_past = sum(nodes_prov[nodes_prov$chap<aChap-1,]$ratio)
    Chaps_provenances_stats[Chaps_provenances_stats$chap_index==aChap,]$shifted_next = sum(nodes_prov[nodes_prov$chap>aChap+1,]$ratio)
    
    Chaps_provenances_stats[Chaps_provenances_stats$chap_index==aChap,]$total_next = Chaps_provenances_stats[Chaps_provenances_stats$chap_index==aChap,]$next_p + 
      Chaps_provenances_stats[Chaps_provenances_stats$chap_index==aChap,]$shifted_next 
    
  }
  
  
  
  
  chaps=data.frame(part_id= unique(structure[which(structure$type=='title-2'),]$part_id))
  chaps$chap_index=1:nrow(chaps)
  ChapsProvenancesData =merge(Chaps_provenances_stats[,-c(7)], chaps)
  
  
  
  tome_indexes=1:(max(structure$tome_index,na.rm=TRUE))
  
  Tomes_destinations_stats = data.frame(tome_index=tome_indexes,precedent=0,shifted_past=0,identity=0,next_p=0,shifted_next=0,total_back=0)
  for(aTome in 1:max(tome_indexes))
  {
    aTomeDest = data.frame(tome=1:(nrow(tomeFollow)), frequence=tomeFollow[aTome,])
    aTomeDest = aTomeDest[which(aTomeDest$tome!=aTome),]
    
    nodes_dest=aTomeDest
    nodes_dest$ratio = round(nodes_dest$frequence*100/sum(nodes_dest$frequence),0)
    
    
    
    if((aTome-1) %in% nodes_dest$tome) 
      Tomes_destinations_stats[Tomes_destinations_stats$tome_index==aTome,]$precedent = 
      nodes_dest[nodes_dest$tome==aTome-1,]$ratio
    if((aTome+1) %in% nodes_dest$tome) 
      Tomes_destinations_stats[Tomes_destinations_stats$tome_index==aTome,]$next_p = nodes_dest[nodes_dest$tome==aTome+1,]$ratio
    
    Tomes_destinations_stats[Tomes_destinations_stats$tome_index==aTome,]$shifted_past = sum(nodes_dest[nodes_dest$tome<aTome-1,]$ratio)
    Tomes_destinations_stats[Tomes_destinations_stats$tome_index==aTome,]$shifted_next = sum(nodes_dest[nodes_dest$tome>aTome+1,]$ratio)
    
    Tomes_destinations_stats[Tomes_destinations_stats$tome_index==aTome,]$total_back = Tomes_destinations_stats[Tomes_destinations_stats$tome_index==aTome,]$precedent + 
      Tomes_destinations_stats[Tomes_destinations_stats$tome_index==aTome,]$shifted_past 
    
  }
  
  tomePrecedent <- t(tomeFollow)
  Tomes_provenances_stats = data.frame(tome_index=tome_indexes,precedent=0,shifted_past=0,identity=0,next_p=0,shifted_next=0,total_next=0)
  for(aTome in 1:max(tome_indexes))
  {
    aTomeProv = data.frame(tome=1:nrow(tomePrecedent), frequence=tomePrecedent[aTome,])
    aTomeProv = aTomeProv[which(aTomeProv$tome!=aTome),]
    
    nodes_prov=aTomeProv
    nodes_prov$ratio = round(nodes_prov$frequence*100/sum(nodes_prov$frequence),0)
    
    if((aTome) %in% nodes_prov$tome)
      Tomes_provenances_stats[which(Tomes_provenances_stats$tome_index==aTome),]$identity = nodes_prov[nodes_prov$tome==aTome,]$ratio
    
    if((aTome-1) %in% nodes_prov$tome) 
      Tomes_provenances_stats[Tomes_provenances_stats$tome_index==aTome,]$precedent = nodes_prov[nodes_prov$tome==aTome-1,]$ratio
    if((aTome+1) %in% nodes_prov$tome) 
      Tomes_provenances_stats[Tomes_provenances_stats$tome_index==aTome,]$next_p = nodes_prov[nodes_prov$tome==aTome+1,]$ratio
    
    Tomes_provenances_stats[Tomes_provenances_stats$tome_index==aTome,]$shifted_past = sum(nodes_prov[nodes_prov$tome<aTome-1,]$ratio)
    Tomes_provenances_stats[Tomes_provenances_stats$tome_index==aTome,]$shifted_next = sum(nodes_prov[nodes_prov$tome>aTome+1,]$ratio)
    
    Tomes_provenances_stats[Tomes_provenances_stats$tome_index==aTome,]$total_next = Tomes_provenances_stats[Tomes_provenances_stats$tome_index==aTome,]$next_p + 
      Tomes_provenances_stats[Tomes_provenances_stats$tome_index==aTome,]$shifted_next 
    
  }
  
  tomes=data.frame(part_id= unique(structure[which(structure$type=='title-1'),]$part_id))
  tomes$tome_index=1:nrow(tomes)
  TomesProvenancesData =merge(Tomes_provenances_stats[,-c(7)], tomes)
  
  ####### PROVENANCE : MAX SHIFTED NEXT
  byParts =  PartsProvenancesData[which(PartsProvenancesData$shifted_next>25 & PartsProvenancesData$part_index>1),c('part_id','shifted_next')]
  byParts$classe="Transition"
  byParts$issueCode="TransProvShiftNext"
  byParts$content="Trop d\'arrivées depuis des sections suivantes"
  byParts$description=paste('Dans',byParts$shifted_next,"% des cas, la section lue avant n'est pas celle qui précède mais est une partie située après cette section")
  byParts$suggestion_title="Déplacer cette section ou l'englober dans une autre section ou chapitre"
  byParts$suggestion_content="Cette section doit probablement être un pré-requis à la lecture d'autre(s) chapitre(s) ou section(s), n'y a t-il pas une restructuration du cours/chapitre/partie plus intéressante pour éviter ce phénomène ?"
  
  byChaps =  ChapsProvenancesData[which(ChapsProvenancesData$shifted_next>25 & ChapsProvenancesData$chap_index>1),c('part_id','shifted_next')]
  byChaps$classe="Transition"
  byChaps$issueCode="TransProvShiftNext"
  byChaps$content="Trop d\'arrivées depuis des chapitres suivants"
  byChaps$description=paste('Dans',byChaps$shifted_next,"% des cas, le chapitre lu avant n'est pas celui qui précède mais est un chapitre situé après ce chapitre")
  byChaps$suggestion_title="Déplacer ce chapitre ou l'englober dans un autre chapitre ou partie"
  byChaps$suggestion_content="Ce chapitre doit probablement être un pré-requis à la lecture d'autre(s) chapitre(s) ou partie(s), n'y a t-il pas une 
restructuration du cours/chapitre/partie plus intéressante pour éviter ce phénomène ?"
  
  byTomes =  TomesProvenancesData[which(TomesProvenancesData$shifted_next>25 & TomesProvenancesData$tome_index>1),c('part_id','shifted_next')]
  byTomes$classe="Transition"
  byTomes$issueCode="TransProvShiftNext"
  byTomes$content="Trop d\'arrivées depuis des chapitres suivants"
  byTomes$description=paste('Dans',byTomes$shifted_next,"% des cas, le chapitre lu avant n'est pas celui qui précède mais est un chapitre situé après ce chapitre")
  byTomes$suggestion_title="Déplacer ce chapitre ou l'englober dans un autre chapitre ou partie"
  byTomes$suggestion_content="Ce chapitre doit probablement être un pré-requis à la lecture d'autre(s) chapitre(s) ou partie(s), n'y a t-il pas une restructuration du cours/chapitre/partie plus intéressante pour éviter ce phénomène ?"
  
  maxProvSHiftedNext =  rbind(byParts,byChaps,byTomes)
  
  ####### PROVENANCE : MAX SHIFTED PAST
  byParts = PartsProvenancesData[which(PartsProvenancesData$shifted_past>20),c('part_id','shifted_past')]
  byParts$classe="Transition"
  byParts$issueCode="TransProvShiftPast"
  byParts$content="Trop d\'arrivées depuis des sections précédentes éloignées"
  byParts$description=paste('Dans',byParts$shifted_past," la section lue avant n'est pas directement celle qui précède mais est une partie précédente éloignée.")
  byParts$suggestion_title="Revoir la section"
  byParts$suggestion_content="Est-ce que cette section est bien positionnée dans le plan du cours ?"
  
  byChaps = ChapsProvenancesData[which(ChapsProvenancesData$shifted_past>20),c('part_id','shifted_past')]
  byChaps$classe="Transition"
  byChaps$issueCode="TransProvShiftPast"
  byChaps$content="Trop d\'arrivées depuis des chapitre précédents éloignés"
  byChaps$description=paste('Dans',byChaps$shifted_past," le chapitre  lu avant n'est pas directement celui qui précède mais est un chapitre précédent éloigné.")
  byChaps$suggestion_title="Revoir le chapitre"
  byChaps$suggestion_content="Est-ce que ce chapitre est bien positionné dans le plan du cours ?"
  
  byTomes = ChapsProvenancesData[which(ChapsProvenancesData$shifted_past>20),c('part_id','shifted_past')]
  byTomes$classe="Transition"
  byTomes$issueCode="TransProvShiftPast"
  byTomes$content="Trop d\'arrivées depuis des parties précédentes éloignées"
  byTomes$description=paste('Dans',byTomes$shifted_past," la partie  lu avant n'est pas directement celle qui précède mais est une partie précédente éloignée.")
  byTomes$suggestion_title="Revoir la partie"
  byTomes$suggestion_content="Est-ce que la partie est bien positionnée dans le plan du cours ?"
  
  maxProvSHiftedPast =  rbind(byParts,byChaps,byTomes)
  
  ################## DESTINATION  
  
  ####### DESTINATION : MAX SHIFTED PAST    

PartsDestinationsData =merge(Parts_destinations_stats[,-c(7)], structure[,c('part_index','part_id')])

  byParts = PartsDestinationsData[which(PartsDestinationsData$shifted_past>25),c('part_id','shifted_past')]
  byParts$classe="Transition"
  byParts$issueCode="TransDestPast"
  byParts$content="Trop de départs vers des sections précédentes"
  byParts$description=paste("Dans",byParts$shifted_past,"% des cas, la section lue après n'est pas celle qui suit mais est une partie située avant cette section")
  byParts$suggestion_title="Revoir cette section du cours"
  byParts$suggestion_content="Est-ce que cette section est bien positionnée dans le plan du cours?"

chaps=data.frame(part_id= unique(structure[which(structure$type=='title-2'),]$part_id))
chaps$chap_index=1:nrow(chaps)
ChapsDestinationsData =merge(Chaps_destinations_stats[,-c(7)], chaps)


  byChaps = ChapsDestinationsData[which(ChapsDestinationsData$shifted_past>25),c('part_id','shifted_past')]
  byChaps$classe="Transition"
  byChaps$issueCode="TransDestPast"
  byChaps$content="Trop de départ vers des chapitres précédents"
  byChaps$description=paste("Dans",byChaps$shifted_past,"% des cas, le chapitre lu après n'est pas celui qui suit 
                            mais est un chapitre situé avant ce chapitre")
  byChaps$suggestion_title="Revoir ce chapitre du cours"
  byChaps$suggestion_content="Est-ce que ce chapitre est bien positionné dans le plan du cours?"

tomes=data.frame(part_id= unique(structure[which(structure$type=='title-1'),]$part_id))
tomes$tome_index=1:nrow(tomes)
TomesDestinationsData =merge(Tomes_destinations_stats[,-c(7)], tomes)

byTomes = TomesDestinationsData[which(TomesDestinationsData$shifted_past>25),
                                c('part_id','shifted_past')]
  byTomes$classe="Transition"
  byTomes$issueCode="TransDestPast"
  byTomes$content="Trop de départ vers des parties précédentes"
  byTomes$description=paste("Dans",byTomes$shifted_past,"% des cas, la partie lue après n'est pas celle qui suit 
                            mais est une partie située avant cette partie")
  byTomes$suggestion_title="Revoir cette partie du cours"
  byTomes$suggestion_content="Est-ce que cette partie est bien positionnée dans le plan du cours?"

maxDestSHiftedPast =  rbind(byParts,byChaps,byTomes)



#Parties plus en avant
  byParts = PartsDestinationsData[which(PartsDestinationsData$shifted_next>20),c('part_id','shifted_next')]
  byParts$classe="Transition"
  byParts$issueCode="TransDestShiftNext"
  byParts$content="Trop de départs vers des sections suivantes éloignées"
  byParts$description=paste("Dans",byParts$shifted_next,"% des cas, la section lue après n'est pas directement celle qui suit mais est une section suivante éloignée.")
  byParts$suggestion_title="Revoir cette section du cours"
  byParts$suggestion_content="Est-ce que cette section est bien positionnée dans le plan du cours ?"

  byChaps = ChapsDestinationsData[which(ChapsDestinationsData$shifted_next>20),c('part_id','shifted_next')]
  byChaps$classe="Transition"
  byChaps$issueCode="TransDestShiftNext"
  byChaps$content="Trop de déChaps vers des chapitres suivants éloignés"
  byChaps$description=paste("Dans",byChaps$shifted_next,"% des cas, le chapitre lu après n'est pas directement celui qui suit mais est un chapitre suivant éloigné.")
  byChaps$suggestion_title="Revoir ce chapitre du cours"
  byChaps$suggestion_content="Est-ce que ce chapitre est bien positionné dans le plan du cours ?"

  byTomes = TomesDestinationsData[which(TomesDestinationsData$shifted_next>20),c('part_id','shifted_next')]
  byTomes$classe="Transition"
  byTomes$issueCode="TransDestShiftNext"
  byTomes$content="Trop de déTomes vers des chapitres suivants éloignés"
  byTomes$description=paste("Dans",byTomes$shifted_next,"% des cas, la partie lue après n'est pas directement celle qui suit mais est une partie suivante éloignée.")
  byTomes$suggestion_title="Revoir cette partie du cours"
  byTomes$suggestion_content="Est-ce que cette partie est bien positionnée dans le plan du cours ?"

maxDestSHiftedNext =  rbind(byParts,byChaps,byTomes)


############################################# IV. STOP ################################################   
  # arrets de seances
parts=unique(structure[which(structure$type=='title-3'),]$part_id)
StopData = Ruptures[which(Ruptures$part_id %in%parts),c('part_id','rupture')]
medianR = round(100* median(StopData$rupture)/sum(StopData$rupture),2)
byParts = StopData[which(StopData$rupture>quantile(StopData$rupture,0.9,na.rm = TRUE)),]
byParts$rupture=round(byParts$rupture * 100 / sum(StopData$rupture),1)
byParts$classe="Stop"
byParts$issueCode="StopRSEnd"
byParts$content=paste( "Trop de séances de lecture se terminent sur cette section")
byParts$description=paste(byParts$rupture, "% de fins de séances de lecture se passent sur cette section. La valeur moyenne pour les autres parties est de",medianR,"%")
byParts$suggestion_title="Réécrire et simplifier cette section"
byParts$suggestion_content="Cette section a besoin d\'être plus simple à lire et à comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller à l\'essentiel"

chaps=unique(structure[which(structure$type=='title-2'),]$part_id)
StopData = Ruptures[which(Ruptures$part_id %in%chaps),c('part_id','rupture')]
medianR = round(100* median(StopData$rupture)/sum(StopData$rupture),2)
byChaps = StopData[which(StopData$rupture>quantile(StopData$rupture,0.9,na.rm = TRUE)),]
byChaps$rupture=round(byChaps$rupture * 100 / sum(StopData$rupture),1)
byChaps$classe="Stop"
byChaps$issueCode="StopRSEnd"
byChaps$content=paste( "Trop de séances de lecture se terminent sur ce chapitre")
byChaps$description=paste(byChaps$rupture, "% de fins de séances de lecture se passent sur ce chapitre. La valeur moyenne pour les autres chapitre est de",medianR,"%")
byChaps$suggestion_title="Réécrire et simplifier ce chapitre"
byChaps$suggestion_content="Ce chapitre a besoin d\'être plus simple à lire et à comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller à l\'essentiel"

tomes=unique(structure[which(structure$type=='title-1'),]$part_id)
StopData = Ruptures[which(Ruptures$part_id %in%tomes),c('part_id','rupture')]
medianR = round(100* median(StopData$rupture)/sum(StopData$rupture),2)
byTomes = StopData[which(StopData$rupture>quantile(StopData$rupture,0.9,na.rm = TRUE)),]
byTomes$rupture=round(byTomes$rupture * 100 / sum(StopData$rupture),1)
byTomes$classe="Stop"
byTomes$issueCode="StopRSEnd"
byTomes$content=paste( "Trop de séances de lecture se terminent sur cette partie")
byTomes$description=paste(byTomes$rupture, "% de fins de séances de lecture se passent sur cette partie La valeur moyenne pour les autres parties est de",medianR,"%")
byTomes$suggestion_title="Réécrire et simplifier cette partie"
byTomes$suggestion_content="Cette partie a besoin d\'être plus simple à lire et à comprendre : 
- utiliser un vocabulaire plus commun ou directement défini dans le texte, 
- vérifier l'enchaînement logique des propos
- ajouter des exemples/analogies pour améliorer la compréhension
- éviter les dispersions : aller à l\'essentiel"
  
maxRStops =  rbind(byParts,byChaps,byTomes)  


####### Ruptures sur les sections
parts=unique(structure[which(structure$type=='title-3'),]$part_id)
StopData = Ruptures[which(Ruptures$part_id %in%parts),]


names(minVisits)[c(1,2)]=
names(minDuration)[c(1,2)]=
names(maxDuration)[c(1,2)]=
names(maxRereadings)[c(1,2)]=
names(maxRereaders)[c(1,2)]=
names(maxProvSHiftedNext)[c(1,2)]=
names(maxProvSHiftedPast)[c(1,2)]=
names(maxDestSHiftedPast)[c(1,2)]=
names(maxDestSHiftedNext)[c(1,2)]=
names(maxRStops)[c(1,2)]=
names(maxFinalStops)[c(1,2)]=c("id","value")

facts = 
  rbind(
    minVisits,
    minDuration,
    maxDuration,
    maxRereadings,
    maxRereaders,
    maxProvSHiftedNext,
    maxProvSHiftedPast,
    maxDestSHiftedPast,
    maxDestSHiftedNext,
    maxRStops,
    maxFinalStops)

  
names(facts)[1]="part_id"

save(facts, file="nodejs.facts.rdata")


library('jsonlite')
library('reshape')


facts.json = toJSON(unname(split(facts, 1:nrow(facts))))
cat(facts.json, file="nodejs.facts.json")





########## RS stats
CourseStats = data.frame(id=0, title='title')
CourseStats$nactions =sum(Interest$Actions_nb)
CourseStats$nusers =length(unique(data$user_id)) 
CourseStats$nRS = nrow(RS)
CourseStats$mean.rs.duration = mean(RS$duration,na.rm = TRUE)
CourseStats$median.rs.duration = median(RS$duration,na.rm = TRUE) 
CourseStats$mean.rs.nparts = mean(RS$nparts,na.rm = TRUE)
CourseStats$median.rs.nparts = median(RS$nparts,na.rm = TRUE) 

# course achievement
CourseStats$mean.achievement = mean(achievement$taux * 100)
CourseStats$median.achievement = median(achievement$taux * 100)
# course stats
CourseStats$mean.visites = mean(Interest$Actions_nb,na.rm = TRUE) 
CourseStats$median.visites = median(Interest$Actions_nb,na.rm = TRUE) 
CourseStats$q1.visites = quantile(Interest$Actions_nb,0.25,na.rm = TRUE) 
CourseStats$q3.visites = quantile(Interest$Actions_nb,0.75,na.rm = TRUE) 
CourseStats$min.visites = quantile(Interest$Actions_nb,0.1,na.rm = TRUE)
CourseStats$max.visites = quantile(Interest$Actions_nb,0.9,na.rm = TRUE)

# course stats
CourseStats$mean.part_duration = mean(structure$q3.duration,na.rm = TRUE) 
CourseStats$median.part_duration = median(structure$q3.duration,na.rm = TRUE)


# readers
CourseStats$mean.readers = mean(Reads$Readers,na.rm = TRUE) 
CourseStats$median.readers = median(Reads$Readers,na.rm = TRUE) 
CourseStats$q1.readers = quantile(Reads$Readers,0.25,na.rm = TRUE) 
CourseStats$q3.readers = quantile(Reads$Readers,0.75,na.rm = TRUE) 
CourseStats$min.readers = quantile(Reads$Readers,0.1,na.rm = TRUE)
CourseStats$max.readers = quantile(Reads$Readers,0.9,na.rm = TRUE)

# rereaders
CourseStats$mean.rereaders = mean(Reads$Rereaders,na.rm = TRUE) 
CourseStats$median.rereaders = median(Reads$Rereaders,na.rm = TRUE) 
CourseStats$q1.rereaders = quantile(Reads$Rereaders,0.25,na.rm = TRUE) 
CourseStats$q3.rereaders = quantile(Reads$Rereaders,0.75,na.rm = TRUE) 
CourseStats$min.rereaders = quantile(Reads$Rereaders,0.1,na.rm = TRUE)
CourseStats$max.rereaders = quantile(Reads$Rereaders,0.9,na.rm = TRUE)

# rereadings
CourseStats$mean.readings = mean(Reads$Readings,na.rm = TRUE) 
CourseStats$median.readings = median(Reads$Readings,na.rm = TRUE) 
CourseStats$q1.readings = quantile(Reads$Readings,0.25,na.rm = TRUE) 
CourseStats$q3.readings = quantile(Reads$Readings,0.75,na.rm = TRUE) 
CourseStats$min.readings = quantile(Reads$Readings,0.1,na.rm = TRUE)
CourseStats$max.readings = quantile(Reads$Readings,0.9,na.rm = TRUE)


# rereadings
CourseStats$mean.rereadings = mean(Reads$Rereadings,na.rm = TRUE) 
CourseStats$median.rereadings = median(Reads$Rereadings,na.rm = TRUE) 
CourseStats$q1.rereadings = quantile(Reads$Rereadings,0.25,na.rm = TRUE) 
CourseStats$q3.rereadings = quantile(Reads$Rereadings,0.75,na.rm = TRUE) 
CourseStats$min.rereadings = quantile(Reads$Rereadings,0.1,na.rm = TRUE)
CourseStats$max.rereadings = quantile(Reads$Rereadings,0.9,na.rm = TRUE)

# sequential_rereadings
CourseStats$mean.seq_rereadings = mean(Reads$Sequential_rereadings,na.rm = TRUE) 
CourseStats$median.seq_rereadings = median(Reads$Sequential_rereadings,na.rm = TRUE) 
CourseStats$q1.seq_rereadings = quantile(Reads$Sequential_rereadings,0.25,na.rm = TRUE) 
CourseStats$q3.seq_rereadings = quantile(Reads$Sequential_rereadings,0.75,na.rm = TRUE) 
CourseStats$min.seq_rereadings = quantile(Reads$Sequential_rereadings,0.1,na.rm = TRUE)
CourseStats$max.seq_rereadings = quantile(Reads$Sequential_rereadings,0.9,na.rm = TRUE)

# decaled_rereadings
CourseStats$mean.dec_rereadings = mean(Reads$Decaled_rereadings,na.rm = TRUE) 
CourseStats$median.dec_rereadings = median(Reads$Decaled_rereadings,na.rm = TRUE) 
CourseStats$q1.dec_rereadings = quantile(Reads$Decaled_rereadings,0.25,na.rm = TRUE) 
CourseStats$q3.dec_rereadings = quantile(Reads$Decaled_rereadings,0.75,na.rm = TRUE) 
CourseStats$min.dec_rereadings = quantile(Reads$Decaled_rereadings,0.1,na.rm = TRUE)
CourseStats$max.dec_rereadings = quantile(Reads$Decaled_rereadings,0.9,na.rm = TRUE)


CourseStats = melt(CourseStats)[,c(2,3)]
names(CourseStats)[1]='property'
CourseStats.json = toJSON(unname(split(CourseStats,1:nrow(CourseStats))))
cat(CourseStats.json, file="stats.json")

rs_stats=RS[,c('nparts','duration')]
rs_stats$duration = round(rs_stats$duration/60,1)
rs_stats = toJSON(unname(split(rs_stats,1:nrow(rs_stats))))
cat(rs_stats, file="rs.json")

