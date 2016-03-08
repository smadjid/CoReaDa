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
load(paste(selectedCourse,"achievement.rdata",sep="."))



course_facts_read<- function(selectedCourse){
  structure = eval(parse(text = paste(selectedCourse,"structure",sep=".")))
  names(structure)[1] = 'id'
  Interest = eval(parse(text = paste(selectedCourse,"Interest",sep=".")))
  Reads = eval(parse(text = paste(selectedCourse,"Reads",sep=".")))
  Ruptures = eval(parse(text = paste(selectedCourse,"Ruptures",sep=".")))
  RS = eval(parse(text = paste(selectedCourse,"RS",sep=".")))
  partFollow=eval(parse(text = paste(selectedCourse,"partFollow",sep=".")))
  data = eval(parse(text = paste(selectedCourse,sep=".")))
  achievement = eval(parse(text = paste(selectedCourse,"achievement",sep=".")))
  
 
  
  
  
  ####### NOMBRE DE VISITES
  
  Interest = Interest[,c(6,2,3,4,5,1,7)]
  
  InterestData = Interest[which(Interest$type=='title-3'),-c(7)]
  
  Interest_nbvisites_vmin = InterestData[which(Interest$Actions_nb<quantile(Interest$Actions_nb,0.10,na.rm = TRUE)),c(1,2)]
  Interest_nbvisites_vmin$classe="Readings"
  Interest_nbvisites_vmin$issueCode="RVminVisit"
  Interest_nbvisites_vmin$content="Beaucoup Trop peu de visites"
  val = round(round(median(Interest$Actions_nb,na.rm = TRUE),0)/ Interest_nbvisites_vmin$Actions_nb,1)
  Interest_nbvisites_vmin$description=paste("cette section est visitée", val,"fois moins que le nombre médian de visites des autres parties.")
  Interest_nbvisites_vmin$norm_value=round(median(Interest$Actions_nb,na.rm = TRUE),0)
  dif = abs(Interest_nbvisites_vmin$Actions_nb  - median(Interest$Actions_nb,na.rm = TRUE))
  Interest_nbvisites_vmin$gravity=round(5 * dif / median(Interest$Actions_nb,na.rm = TRUE),0) 
  Interest_nbvisites_vmin$suggestion_title="Revoir le titre et le contenu"
  Interest_nbvisites_vmin$suggestion_content="Est-ce que le titre de la section résume bien son contenu ? 
Si oui :  Est-ce que cette section est  réellement intéressante par rapport au cours ? Si c'est le cas, peut-elle
être reformulée, voire intégrée ailleurs dans le cours ?  Sinon, la supprimer et revoir le plan du chapitre et du cours. 
  Le cas échéant, il faudrait penser à le reformuler"
  
  
  Interest_nbvisites_min = InterestData[which(Interest$Actions_nb<quantile(Interest$Actions_nb,0.25,na.rm = TRUE) & 
                                                Interest$Actions_nb>quantile(Interest$Actions_nb,0.10,na.rm = TRUE)),c(1,2)]
  Interest_nbvisites_min$classe="Readings"
  Interest_nbvisites_min$issueCode="RminVisit"
  Interest_nbvisites_min$content="Trop peu de visites"
  val = round(round(median(Interest$Actions_nb,na.rm = TRUE),0)/ Interest_nbvisites_min$Actions_nb,2)
  Interest_nbvisites_min$description=paste("cette section est visitée", val," fois moins que le nombre médian de visites des autres parties.")
  Interest_nbvisites_min$norm_value=round(median(Interest$Actions_nb,na.rm = TRUE),0)
  dif = abs(Interest_nbvisites_min$Actions_nb  - median(Interest$Actions_nb,na.rm = TRUE))
  Interest_nbvisites_min$gravity=round(5 * dif / median(Interest$Actions_nb,na.rm = TRUE),0) 
  Interest_nbvisites_min$suggestion_title="Revoir le titre, l'emplacement et le contenu"
  Interest_nbvisites_min$suggestion_content="Est-ce que le titre de la section résume bien son contenu ? 
Si oui :  Est-ce que cette section est  réellement intéressante par rapport au cours ? Si c'est le cas, peut-elle
être reformulée, voire intégrée ailleurs dans le cours ?  Sinon, la supprimer et revoir le plan du chapitre et du cours. 
  Le cas échéant, il faudrait penser à le reformuler"
  
  Interest_nbvisites_max = InterestData[which(Interest$Actions_nb>quantile(Interest$Actions_nb,0.9,na.rm = TRUE) ),c(1,2)]
  Interest_nbvisites_max$classe="Readings"
  Interest_nbvisites_max$issueCode="RVmaxVisit"
  Interest_nbvisites_max$content="Beaucoup de visites"
  val = round(Interest_nbvisites_max$Actions_nb/median(Interest$Actions_nb,na.rm = TRUE),2)
  Interest_nbvisites_max$description=paste("cette section est visitée", val," fois plus que le nombre médian de visites des autres parties.")
  Interest_nbvisites_max$norm_value=round(median(Interest$Actions_nb,na.rm = TRUE),0)
  dif = abs(Interest_nbvisites_max$Actions_nb  - median(Interest$Actions_nb,na.rm = TRUE))
  Interest_nbvisites_max$gravity=round(5 * dif / median(Interest$Actions_nb,na.rm = TRUE),0)
  Interest_nbvisites_max$suggestion_title=" "
  Interest_nbvisites_max$suggestion_content=""
  
  
  
  
  
  ####### DURATION
 
  
  # RVminDuration : mean duration
  Interest_duration_vmin = structure[which(structure$mean.duration<=quantile(structure$mean.duration,0.10,na.rm = TRUE)),c('part_index','mean.duration')]
  Interest_duration_vmin$classe="Readings"
  Interest_duration_vmin$issueCode="RVminDuration"
  Interest_duration_vmin$content="Temps de lecture beaucoup trop court"
  val = round(median(structure$mean.duration,na.rm = TRUE) / Interest_duration_vmin$mean.duration,0)
  Interest_duration_vmin$description=paste("Cette section est plutôt survolés : son temps moyen de lecture est ",val,
                                           " fois inférieur au temps de lecture des autres sections")
  Interest_duration_vmin$norm_value=round(median(structure$mean.duration,na.rm = TRUE) ,1)
  dif = abs(Interest_duration_vmin$max.duration  - median(structure$mean.duration,na.rm = TRUE))
  Interest_duration_vmin$gravity=''
  Interest_duration_vmin$suggestion_title="Réviser ou supprimer la section"
  Interest_duration_vmin$suggestion_content="la section doit apporter plus d'informations nouvelles / intéressantes : 
  Si cet élément est réellement nécessaire : peut-il être reformulé, voire intégré dans un autre chapitre ou une autre partie du cours ?
  Sinon, le supprimer et revoir le plan du chapitre et du cours."
  
  #RminDuration
  Interest_duration_min = structure[which(structure$mean.duration>quantile(structure$mean.duration,0.10,na.rm = TRUE) &
                                            structure$mean.duration<quantile(structure$mean.duration,0.25,na.rm = TRUE)),c('part_index','mean.duration')]
  Interest_duration_min$classe="Readings"
  Interest_duration_min$issueCode="RminDuration"
  Interest_duration_min$content="Temps de lecture trop court"
  val = round(median(structure$mean.duration,na.rm = TRUE) / Interest_duration_min$mean.duration,0)
  Interest_duration_min$description=paste("cette section est plutôt survolés : son temps de lecture est",val,"fois inférieur au temps médian")
  Interest_duration_min$norm_value=round(median(structure$mean.duration,na.rm = TRUE) ,1)
  dif = abs(Interest_duration_min$mean.duration  - median(structure$mean.duration,na.rm = TRUE))
  Interest_duration_min$gravity=round(5 * dif / median(structure$mean.duration,na.rm = TRUE),0)
  Interest_duration_min$suggestion_title="Réviser ou supprimer la section"
  Interest_duration_min$suggestion_content="la section doit apporter plus d'informations nouvelles / intéressantes : 
  Si cette section est réellement nécessaire : peut-elle être reformulée, voire intégrée dans un autre chapitre ou une autre section du cours ?
  Sinon, la supprimer et revoir le plan du chapitre et du cours."
  
  
  #RmaxDuration
  Interest_duration_max = structure[which(structure$mean.duration>quantile(structure$mean.duration,0.9,na.rm = TRUE)),c('part_index','mean.duration')]
  Interest_duration_max$classe="Readings"
  Interest_duration_max$issueCode="RmaxDuration"
  Interest_duration_max$content="Temps de lecture trop long"
  Interest_duration_max$description=paste("La durée de visite sur cette section est relativement très élevée:",Interest_duration_max$mean.duration,
                                          "secondes. La durée  médiane de lecture d'une partie est de: ",round(median(structure$mean.duration,na.rm = TRUE) ,1) ,"secondes.")
  Interest_duration_max$norm_value=round(median(structure$mean.duration,na.rm = TRUE) ,1)
  dif = abs(Interest_duration_max$mean.duration  - median(structure$mean.duration,na.rm = TRUE))
  Interest_duration_max$gravity=round(5 * dif / median(structure$mean.duration,na.rm = TRUE),0)
  Interest_duration_max$suggestion_title="Réccrire la section"
  Interest_duration_max$suggestion_content="la section doit être plus simple ?  lire/comprendre : 
  - utiliser un vocabulaire plus commun ou directement défini dans le texte, 
  - vérifier l'enchaînement logique des propos
  - ajouter des exemples/analogies pour améliorer la compréhension
  - éviter les dispersions : aller ?  l’essentiel"
  
  
}

# 2. Relecture
course_facts_reread<- function(selectedCourse){
  structure = eval(parse(text = paste(selectedCourse,"structure",sep=".")))
  Reads = eval(parse(text = paste(selectedCourse,"Reads",sep=".")))
  Ruptures = eval(parse(text = paste(selectedCourse,"Ruptures",sep=".")))
  RS = eval(parse(text = paste(selectedCourse,"RS",sep=".")))
  CourseStats =  eval(parse(text = paste(selectedCourse,"CourseStats",sep=".")))
  
  Reads$Rereadings = as.numeric(Reads$Rereadings) 
  # rereadings
  # parts data and course stats
  
 
  
  ################################################
  Rereads_rereadings_vmax = Reads[which(Reads$Rereadings>quantile(Reads$Rereadings,0.9,na.rm = TRUE) ),c('part_index','Rereadings')] 
  Rereads_rereadings_vmax$classe="Rereading"
  Rereads_rereadings_vmax$issueCode="RRmax"
  Rereads_rereadings_vmax$content="Beaucoup trop de relectures"
  Rereads_rereadings_vmax$description=paste("cette section est relue",Rereads_rereadings_vmax$Rereadings,"fois. Les autres parties sont en moyenne relues",round(median(Reads$Rereadings,na.rm = TRUE) ,0)," fois")
  Rereads_rereadings_vmax$norm_value=round(median(Reads$Rereadings,na.rm = TRUE) ,1)
  dif = abs(Rereads_rereadings_vmax$Rereadings  - median(Reads$Rereadings,na.rm = TRUE))
  Rereads_rereadings_vmax$gravity=round(5 * dif / median(Reads$Rereadings,na.rm = TRUE),0)
  Rereads_rereadings_vmax$suggestion_title="Simplifier l'écriture de la section et vérifier l'enchainement"
  Rereads_rereadings_vmax$suggestion_content="Vérifier les relectures conjointes et disjointes, si il y a globalement équilibre alors :
  L'élément doit être plus simple ?  lire/comprendre : 
  - utiliser un vocabulaire plus commun ou directement défini dans le texte, 
  - vérifier l'enchaînement logique des propos
  - ajouter des exemples/analogies pour améliorer la compréhension
  - éviter les dispersions : aller ?  l’essentiel.
  
  Sinon, regarder l’indicateur de relecture plus spécifique (même séance ou séances disjointes) pour suggestion"
  
  Rereads_rereadings_max = Reads[which(Reads$Rereadings>quantile(Reads$Rereadings,0.75,na.rm = TRUE)& 
                                         Reads$Rereadings<quantile(Reads$Rereadings,0.9,na.rm = TRUE)),c('part_index','Rereadings')]
  Rereads_rereadings_max$classe="Rereading"
  Rereads_rereadings_max$issueCode="RRmax"
  Rereads_rereadings_max$content="Trop de relectures"
  Rereads_rereadings_max$description=paste("cette section est relue",Rereads_rereadings_max$Rereadings,"fois. Les autres parties sont en moyenne relue",round(median(Reads$Rereadings,na.rm = TRUE) ,0),"fois")
  Rereads_rereadings_max$norm_value=round(median(Reads$Rereadings,na.rm = TRUE) ,1)
  dif = abs(Rereads_rereadings_max$Rereadings  - median(Reads$Rereadings,na.rm = TRUE))
  Rereads_rereadings_max$gravity=round(5 * dif / median(Reads$Rereadings,na.rm = TRUE),0)
  Rereads_rereadings_max$suggestion_title="Simplifier l'écriture de la section et vérifier l'enchainement"
  Rereads_rereadings_max$suggestion_content="Vérifier les relectures conjointes et disjointes, si il y a globalement équilibre alors :
  L'élément doit être plus simple ?  lire/comprendre : 
  - utiliser un vocabulaire plus commun ou directement défini dans le texte, 
  - vérifier l'enchaînement logique des propos
  - ajouter des exemples/analogies pour améliorer la compréhension
  - éviter les dispersions : aller ?  l’essentiel.
  
  Sinon, regarder l’indicateur de relecture plus spécifique (même séance ou séances disjointes) pour suggestion"
  
  
  
  # mêmes séances 
  Reads$Sequential_rereadings = as.numeric(Reads$Sequential_rereadings) 
  
  Rereads_Sequential_rereadings_vmax = Reads[which(Reads$Sequential_rereadings>quantile(Reads$Sequential_rereadings,0.9,na.rm = TRUE)),c('part_index','Sequential_rereadings')]
  Rereads_Sequential_rereadings_vmax$classe="Rereading"
  Rereads_Sequential_rereadings_vmax$issueCode="RRVmaxS"
  Rereads_Sequential_rereadings_vmax$content="Beaucoup trop de relectures conjointes (i.e. dans une même séance de lecture)"
  Rereads_Sequential_rereadings_vmax$description=paste("cette section est successivement relue",Rereads_Sequential_rereadings_vmax$Sequential_rereadings,"fois. Les autres parties sont en moyenne relues",round(median(Reads$Sequential_rereadings,na.rm = TRUE) ,1),"fois")
  Rereads_Sequential_rereadings_vmax$norm_value=round(median(Reads$Sequential_rereadings,na.rm = TRUE) ,1)
  dif = abs(Rereads_Sequential_rereadings_vmax$Sequential_rereadings  - median(Reads$Sequential_rereadings,na.rm = TRUE))
  Rereads_Sequential_rereadings_vmax$gravity=round(5 * dif / median(Reads$Sequential_rereadings,na.rm = TRUE),0)
  Rereads_Sequential_rereadings_vmax$suggestion_title="Simplifier la section"
  Rereads_Sequential_rereadings_vmax$suggestion_content="cette section doit être plus simple ?  lire/comprendre : 
  - utiliser un vocabulaire plus commun ou directement défini dans le texte, 
  - vérifier l'enchaînement logique des propos
  - ajouter des exemples/analogies pour améliorer la compréhension
  - éviter les dispersions : aller à  l’essentiel"
  
  Rereads_Sequential_rereadings_max = Reads[which(Reads$Sequential_rereadings>quantile(Reads$Sequential_rereadings,0.75,na.rm = TRUE)& 
                                                    Reads$Sequential_rereadings<quantile(Reads$Sequential_rereadings,0.9,na.rm = TRUE))
                                                  ,c('part_index','Sequential_rereadings')]
  Rereads_Sequential_rereadings_max$classe="Rereading"
  Rereads_Sequential_rereadings_max$issueCode="RRmaxS"
  Rereads_Sequential_rereadings_max$content="Beaucoup trop de relectures conjointes (i.e. dans une même séance de lecture)"
  Rereads_Sequential_rereadings_max$description=paste("cette section est successivement relue",Rereads_Sequential_rereadings_max$Sequential_rereadings,"fois. Les autres parties sont en moyenne relues",round(median(Reads$Sequential_rereadings,na.rm = TRUE) ,0),"fois")
  Rereads_Sequential_rereadings_max$norm_value=round(median(Reads$Sequential_rereadings,na.rm = TRUE) ,0)
  dif = abs(Rereads_Sequential_rereadings_max$Sequential_rereadings  - median(Reads$Sequential_rereadings,na.rm = TRUE))
  Rereads_Sequential_rereadings_max$gravity=round(5 * dif / median(Reads$Sequential_rereadings,na.rm = TRUE),0)
  Rereads_Sequential_rereadings_max$suggestion_title="Simplifier la section"
  Rereads_Sequential_rereadings_max$suggestion_content="cette section doit être plus simple ?  lire/comprendre : 
  - utiliser un vocabulaire plus commun ou directement défini dans le texte, 
  - vérifier l'enchaînement logique des propos
  - ajouter des exemples/analogies pour améliorer la compréhension
  - éviter les dispersions : aller à  l’essentiel"
  
  
  
  # séances distinctes
  Reads$Decaled_rereadings = as.numeric(Reads$Decaled_rereadings) 
  
  Rereads_Decaled_rereadings_vmax = Reads[which(Reads$Decaled_rereadings>quantile(Reads$Decaled_rereadings,0.9,na.rm = TRUE)),c('part_index','Decaled_rereadings')]
  Rereads_Decaled_rereadings_vmax$classe="Rereading"
  Rereads_Decaled_rereadings_vmax$issueCode="RRVmaxD"
  Rereads_Decaled_rereadings_vmax$content="Beaucoup trop de relectures disjointes (i.e. dans des séances de lecture distinctes)"
  Rereads_Decaled_rereadings_vmax$description=paste("cette section est relue pour rappel",Rereads_Decaled_rereadings_vmax$Decaled_rereadings,"fois. Les autres parties sont en moyenne relues",round(median(Reads$Decaled_rereadings,na.rm = TRUE) ,0),"fois")
  Rereads_Decaled_rereadings_vmax$norm_value=round(median(Reads$Decaled_rereadings,na.rm = TRUE) ,0)
  dif = abs(Rereads_Decaled_rereadings_vmax$Decaled_rereadings  - median(Reads$Decaled_rereadings,na.rm = TRUE))
  Rereads_Decaled_rereadings_vmax$gravity=round(5 * dif / median(Reads$Decaled_rereadings,na.rm = TRUE),0)
  Rereads_Decaled_rereadings_vmax$suggestion_title="Restructurer le cours et/ou ajouter des mémos/rappels"
  Rereads_Decaled_rereadings_vmax$suggestion_content="cette section doit probablement être un pré-requis important pour d'autres éléments du cours.
  N’y a t-il pas une restructuration du cours/chapitre/partie plus intéressante pour éviter ce phénomène (déplacer cette section ou l’englober dans une autre partie ou chapitre) ?"
  
  Rereads_Decaled_rereadings_max = Reads[which(Reads$Decaled_rereadings>quantile(Reads$Decaled_rereadings,0.75,na.rm = TRUE)& 
                                                 Reads$Decaled_rereadings<quantile(Reads$Decaled_rereadings,0.9,na.rm = TRUE)),
                                         c('part_index','Decaled_rereadings')]
  Rereads_Decaled_rereadings_max$classe="Rereading"
  Rereads_Decaled_rereadings_max$issueCode="RRmaxD"
  Rereads_Decaled_rereadings_max$content="Trop de relectures disjointes (i.e. dans des séances de lecture distinctes)"
  Rereads_Decaled_rereadings_max$description=paste("cette section est relue pour rappel",Rereads_Decaled_rereadings_max$Decaled_rereadings,"fois. Les autres parties sont en moyenne relues",round(median(Reads$Decaled_rereadings,na.rm = TRUE) ,0),"fois")
  Rereads_Decaled_rereadings_max$norm_value=round(median(Reads$Decaled_rereadings,na.rm = TRUE) ,1)
  dif = abs(Rereads_Decaled_rereadings_max$Decaled_rereadings  - median(Reads$Decaled_rereadings,na.rm = TRUE))
  Rereads_Decaled_rereadings_max$gravity=round(5 * dif / median(Reads$Decaled_rereadings,na.rm = TRUE),0)
  Rereads_Decaled_rereadings_max$suggestion_title="Restructurer le cours et/ou ajouter des mémos/rappels"
  Rereads_Decaled_rereadings_max$suggestion_content="cette section doit probablement être un pré-requis important pour d'autres éléments du cours.
  N’y a t-il pas une restructuration du cours/chapitre/partie plus intéressante pour éviter ce phénomène (déplacer cette section ou l’englober dans une autre partie ou chapitre) ?"
  
  
  
  
}




course_facts_transition<- function(selectedCourse){
  structure = eval(parse(text = paste(selectedCourse,"structure",sep=".")))
  Interest = eval(parse(text = paste(selectedCourse,"Interest",sep=".")))
  Reads = eval(parse(text = paste(selectedCourse,"Reads",sep=".")))
  Ruptures = eval(parse(text = paste(selectedCourse,"Ruptures",sep=".")))
  RS = eval(parse(text = paste(selectedCourse,"RS",sep=".")))
  partFollow = eval(parse(text = paste(selectedCourse,"partFollow",sep=".")))
  
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
  
  # Partie précédente 
  # TODO: remove this
  Transition_provenance_precedent = ProvenancesData[which(ProvenancesData$precedent<70 & ProvenancesData$precedent>=50),c('part_index','precedent')]
  Transition_provenance_precedent$classe="Transition"
  Transition_provenance_precedent$issueCode="TransProvPrec"
  Transition_provenance_precedent$content="Les arrivées vers cette section ne sont pas toujours séquentielles. 
  Tout en restant majoritaire, beaucoup d'arrivées ne sont pas de la section précédente"
  Transition_provenance_precedent$norm_value=" "
  Transition_provenance_precedent$gravity = -1
  ProvenancesData1 = ProvenancesData[which(ProvenancesData$flag==1),-c(7)]
  for(i in 1:nrow(ProvenancesData1)){
    value = ProvenancesData1[i,'precedent']
    colN = names(ProvenancesData1[i,-c(1)])[(max.col(ProvenancesData1[i,-c(1)]))]
    
    valN = paste(ProvenancesData1[i,colN],"%")
    Transition_provenance_precedent[i,'description']=paste("Plus de",ProvenancesData1[i,colN],"% des sections lues avant cette section se situent beaucoup plus an arrière dans la structure du cours. L'arrivée depuis la section qui précède celle-ci ne représente que",value,"% des arrivées")
  }
  Transition_provenance_precedent$suggestion_title="Essayez de revoir la structure du cours et peut être d'inclure un rappel de cette section ailleurs"
  Transition_provenance_precedent$suggestion_content=""
  
  # TODO: remove this
  Transition_provenance_precedent_v = ProvenancesData[which(ProvenancesData$precedent<50),c('part_index','precedent')]
  Transition_provenance_precedent_v$classe="Transition"
  Transition_provenance_precedent_v$issueCode="TransProvPrecV"
  Transition_provenance_precedent_v$content="Les arrivées vers cette section ne sont pas toujours séquentielles. AU moins une arrivée sur deux provient d'autres parties."
  Transition_provenance_precedent_v$norm_value=" "
  Transition_provenance_precedent_v$gravity = -1
  ProvenancesData1 = ProvenancesData[which(ProvenancesData$flag==1),-c(7)]
  for(i in 1:nrow(ProvenancesData1)){
    value = ProvenancesData1[i,'precedent']
    colN = names(ProvenancesData1[i,-c(1)])[(max.col(ProvenancesData1[i,-c(1)]))]
    
    valN = paste(ProvenancesData1[i,colN],"%")
    Transition_provenance_precedent_v[i,'description']=paste("Plus de",ProvenancesData1[i,colN],"% des sections lues avant cette section se situent beaucoup plus an arrière dans la structure du cours. L'arrivée depuis la section qui précède celle-ci ne représente que",value,"% des arrivées")
  }
  Transition_provenance_precedent_v$suggestion_title="Essayez de revoir la structure du cours et peut être d'inclure un rappel de cette section ailleurs"
  Transition_provenance_precedent_v$suggestion_content=""
  
  # TODO: remove this
  #Partie qui suit
  Transition_provenance_next = ProvenancesData[which(ProvenancesData$next_p>20 & ProvenancesData$next_p<50),c('part_index','next_p')]
  Transition_provenance_next$classe="Transition"
  Transition_provenance_next$issueCode="TransProvNext"
  Transition_provenance_next$content="Beaucoup d\'arrivées depuis de la section qui suit"
  Transition_provenance_next$description=paste('Dans',Transition_provenance_next$next_p,"% des cas, la section lue avant celle-ci est celle quii
                                                  la suit dans la structure du cours. Ce sont souvent des retours en arrière")
  Transition_provenance_next$norm_value=''
  Transition_provenance_next$gravity = -1
  Transition_provenance_next$suggestion_title="Revoir la structure du cours"
  Transition_provenance_next$suggestion_content=""
  
  
  # TODO: remove this
  Transition_provenance_next_v = ProvenancesData[which(ProvenancesData$next_p>=50),c('part_index','next_p')]
  Transition_provenance_next_v$classe="Transition"
  Transition_provenance_next_v$issueCode="TransProvNextV"
  Transition_provenance_next_v$content="Enormément d\'arrivées depuis de la section qui suit"
  Transition_provenance_next_v$description=paste('Dans',Transition_provenance_next_v$next_p,"% des cas, la section lue avant celle-ci est celle quii
                                                  la suit dans la structure du cours. Ce sont souvent des retours en arrière")
  Transition_provenance_next_v$norm_value=''
  Transition_provenance_next_v$gravity = -1
  Transition_provenance_next_v$suggestion_title="Revoir la structure du cours"
  Transition_provenance_next_v$suggestion_content=""
  
  # Parties suivantes
  
  Transition_provenance_shiftednext = ProvenancesData[which(ProvenancesData$shifted_next>20 & ProvenancesData$shifted_next<50),c('part_index','shifted_next')]
  Transition_provenance_shiftednext$classe="Transition"
  Transition_provenance_shiftednext$issueCode="TransProvShiftNext"
  Transition_provenance_shiftednext$content="Trop d\'arrivées depuis des sections suivantes"
  Transition_provenance_shiftednext$description=paste('Dans',Transition_provenance_shiftednext$shifted_next,"% des cas, la section lue avant n’est pas celle qui précède mais est une partie située après cette section")
  Transition_provenance_shiftednext$norm_value=''
  Transition_provenance_shiftednext$gravity = -1
  Transition_provenance_shiftednext$suggestion_title="Déplacer cette section ou l’englober dans une autre section ou chapitre"
  Transition_provenance_shiftednext$suggestion_content="Cette section doit probablement être un pré-requis à la lecture d’autre(s) chapitre(s) ou section(s), n’y a t-il pas une restructuration du cours/chapitre/partie plus intéressante pour éviter ce phénomène ?"
  
  
  Transition_provenance_shiftednext_v = ProvenancesData[which(ProvenancesData$shifted_next>=50),c('part_index','shifted_next')]
  Transition_provenance_shiftednext_v$classe="Transition"
  Transition_provenance_shiftednext_v$issueCode="TransProvShiftNextV"
  Transition_provenance_shiftednext_v$content="Beaucoup trop d\'arrivées depuis des sections suivantes"
  Transition_provenance_shiftednext_v$description=paste('Dans',Transition_provenance_shiftednext_v$shifted_next,"% des cas, la section lue avant n’est pas celle qui précède mais est une partie située après cette section")
  Transition_provenance_shiftednext_v$norm_value=''
  Transition_provenance_shiftednext_v$gravity = -1
  Transition_provenance_shiftednext_v$suggestion_title="Déplacer cette section ou l’englober dans une autre section ou chapitre"
  Transition_provenance_shiftednext_v$suggestion_content="Cette section doit probablement être un pré-requis à la lecture d’autre(s) chapitre(s) ou section(s), n’y a t-il pas une restructuration du cours/chapitre/partie plus intéressante pour éviter ce phénomène ?"
  
  # Parties précédentes
  
  Transition_provenance_shiftedpast = ProvenancesData[which(ProvenancesData$shifted_past>20 & ProvenancesData$shifted_past<50),c('part_index','shifted_past')]
  Transition_provenance_shiftedpast$classe="Transition"
  Transition_provenance_shiftedpast$issueCode="TransProvShiftPast"
  Transition_provenance_shiftedpast$content="Trop d\'arrivées depuis des sections précédentes éloignées"
  Transition_provenance_shiftedpast$description=paste('Dans',Transition_provenance_shiftedpast$shifted_past," la section lue avant n’est pas directement celle qui précède mais est une partie précédente éloignée.")
  Transition_provenance_shiftedpast$norm_value=''
  Transition_provenance_shiftedpast$gravity = -1
  Transition_provenance_shiftedpast$suggestion_title="Revoir la section"
  Transition_provenance_shiftedpast$suggestion_content="Est-ce que cette section est bien positionnée dans le plan du cours ?"
  
  
  Transition_provenance_shiftedpast_v = ProvenancesData[which(ProvenancesData$shifted_past>=50),c('part_index','shifted_past')]
  Transition_provenance_shiftedpast_v$classe="Transition"
  Transition_provenance_shiftedpast_v$issueCode="TransProvShiftPastV"
  Transition_provenance_shiftedpast_v$content="Beaucoup trop d\'arrivées depuis des sections précédentes éloignées"
  Transition_provenance_shiftedpast_v$description=paste('Dans',Transition_provenance_shiftedpast_v$shifted_past,"% des cas, la section lue avant celle-ci se situe plus en avant dans la structure du cours. Ce sont souvent des retours en arrière")
  Transition_provenance_shiftedpast_v$norm_value=''
  Transition_provenance_shiftedpast_v$gravity = -1
  Transition_provenance_shiftedpast_v$suggestion_title="Revoir la section"
  Transition_provenance_shiftedpast_v$suggestion_content="Est-ce que cette section est bien positionnée dans le plan du cours ?"
  
  
  ################## DESTINATION
  DestinationsData = Destinations_stats[,-c(7)]
  # Partie qui suit 
  # TODO: remove this
  Transition_Destination_next = DestinationsData[which(DestinationsData$next_p>=50 & DestinationsData$next_p<70),c('part_index','next_p')]
  Transition_Destination_next$classe="Transition"
  Transition_Destination_next$issueCode="TransDestNext"
  Transition_Destination_next$content="Importante navigation vers des sections autres que celle qui suit"
  Transition_Destination_next$norm_value=" "
  Transition_Destination_next$gravity = -1
  DestinationsData1 = DestinationsData[which(DestinationsData$flag==1),-c(7)]
  for(i in 1:nrow(DestinationsData1)){
    value = DestinationsData1[i,'next_p']
    colN = names(DestinationsData1[i,-c(1)])[(max.col(DestinationsData1[i,-c(1)]))]
    valN = paste(DestinationsData1[i,colN],"%")
    Transition_Destination_next[i,'description']=paste("Dans",(100-value),"% des cas, la section lue après celle-ci n'est pas celle qui la suit dans la structure du cours. Cette dernière ne représente que",value,"% des cas")
  }
  Transition_Destination_next$suggestion_title="Revoir la structure du cours"
  Transition_Destination_next$suggestion_content=""
  
  
  #parties plus en avant
  # TODO: remove this
  Transition_Destination_next_v = DestinationsData[which(DestinationsData$next_p<50),c('part_index','next_p')]
  Transition_Destination_next_v$classe="Transition"
  Transition_Destination_next_v$issueCode="TransDestNextV"
  Transition_Destination_next_v$content="Trop importante navigation vers des sections autres que celle qui suit"
  Transition_Destination_next_v$norm_value=" "
  Transition_Destination_next_v$gravity = -1
  DestinationsData1 = DestinationsData[which(DestinationsData$flag==1),-c(7)]
  for(i in 1:nrow(DestinationsData1)){
    value = DestinationsData1[i,'next_p']
    colN = names(DestinationsData1[i,-c(1)])[(max.col(DestinationsData1[i,-c(1)]))]
    valN = paste(DestinationsData1[i,colN],"%")
    Transition_Destination_next_v[i,'description']=paste("Dans",(100-value),"% des cas, la section lue après celle-ci n'est pas celle qui la suit dans la structure du cours. Cette dernière ne représente que",value,"% des cas")
  }
  Transition_Destination_next_v$suggestion_title="Revoir la structure du cours"
  Transition_Destination_next_v$suggestion_content=""
  
   # Retour en arrière

  Transition_Destination_shiftedback = DestinationsData[which(DestinationsData$shifted_past>20 & DestinationsData$shifted_past<=50),c('part_index','shifted_past')]
  Transition_Destination_shiftedback$classe="Transition"
  Transition_Destination_shiftedback$issueCode="TransDestPast"
  Transition_Destination_shiftedback$content="Trop de départs vers des sections précédentes"
  Transition_Destination_shiftedback$description=paste("Dans",Transition_Destination_shiftedback$shifted_past,"% des cas, la section lue après n’est pas celle qui suit mais est une partie située avant cette section")
  Transition_Destination_shiftedback$norm_value=" "
  Transition_Destination_shiftedback$gravity = -1
  Transition_Destination_shiftedback$suggestion_title="Revoir cette section du cours"
  Transition_Destination_shiftedback$suggestion_content="Est-ce que cette section est bien positionnée dans le plan du cours?"
  
  Transition_Destination_shiftedback_v = DestinationsData[which(DestinationsData$shifted_past>50),c('part_index','shifted_past')]
  Transition_Destination_shiftedback_v$classe="Transition"
  Transition_Destination_shiftedback_v$issueCode="TransDestPastV"
  Transition_Destination_shiftedback_v$content="Beaucoup trop de départs vers des sections précédentes"
  Transition_Destination_shiftedback_v$description=paste("Dans",Transition_Destination_shiftedback_v$shifted_past,"% des cas, la section lue après n’est pas celle qui suit mais est une partie située avant cette section")
  Transition_Destination_shiftedback_v$norm_value=" "
  Transition_Destination_shiftedback_v$gravity = -1
  Transition_Destination_shiftedback_v$suggestion_title="Revoir cette section du cours"
  Transition_Destination_shiftedback_v$suggestion_content="Est-ce que cette section est bien positionnée dans le plan du cours?"
  
  #Parties plus en avant
  Transition_Destination_shiftednext = DestinationsData[which(DestinationsData$shifted_next>20 & DestinationsData$shifted_next<=50),c('part_index','shifted_next')]
  Transition_Destination_shiftednext$classe="Transition"
  Transition_Destination_shiftednext$issueCode="TransDestShiftNext"
  Transition_Destination_shiftednext$content="Trop de départs vers des sections suivantes éloignées"
  Transition_Destination_shiftednext$description=paste("Dans",Transition_Destination_shiftednext$shifted_next,"% des cas, la section lue après n’est pas directement celle qui suit mais est une partie suivante éloignée.")
  Transition_Destination_shiftednext$norm_value=" "
  Transition_Destination_shiftednext$gravity = -1
  Transition_Destination_shiftednext$suggestion_title="Revoir cette section du cours"
  Transition_Destination_shiftednext$suggestion_content="Est-ce que cette section est bien positionné dans le plan du cours ?"
  
  Transition_Destination_shiftednext_v = DestinationsData[which(DestinationsData$shifted_next>50),c('part_index','shifted_next')]
  Transition_Destination_shiftednext_v$classe="Transition"
  Transition_Destination_shiftednext_v$issueCode="TransDestShiftNextV"
  Transition_Destination_shiftednext_v$content="Beaucoup trop de départs vers des sections suivantes éloignées"
  Transition_Destination_shiftednext_v$description=paste("Dans",Transition_Destination_shiftednext_v$shifted_past,"% des cas, la section lue après n’est pas directement celle qui suit mais est une partie suivante éloignée.")
  Transition_Destination_shiftednext_v$norm_value=" "
  Transition_Destination_shiftednext_v$gravity = -1
  Transition_Destination_shiftednext_v$suggestion_title="Revoir cette section du cours"
  Transition_Destination_shiftednext_v$suggestion_content="Est-ce que cette section est bien positionné dans le plan du cours ?"
  
}

course_facts_stop<- function(selectedCourse){
  structure = eval(parse(text = paste(selectedCourse,"structure",sep=".")))
  Interest = eval(parse(text = paste(selectedCourse,"Interest",sep=".")))
  Reads = eval(parse(text = paste(selectedCourse,"Reads",sep=".")))
  Ruptures = eval(parse(text = paste(selectedCourse,"Ruptures",sep=".")))
  RS = eval(parse(text = paste(selectedCourse,"RS",sep=".")))
  
   
  # arrets de seances
  medianR = round(100* median(Ruptures$rupture)/sum(Ruptures$rupture),2)
  Stop_stop_max = Ruptures[which(Ruptures$rupture>quantile(Ruptures$rupture,0.9,na.rm = TRUE)),c('part_index','rupture')]
  Stop_stop_max$rupture=round(Stop_stop_max$rupture * 100 / sum(Ruptures$rupture),1)
  Stop_stop_max$classe="Stop"
  Stop_stop_max$issueCode="StopRSEnd"
  Stop_stop_max$content=paste( "Trop de séances de lecture se terminent sur cette section")
  Stop_stop_max$description=paste(Stop_stop_max$rupture, "% de fins de séances de lecture se passent sur cette section. La valeur médian pour les autres parties est de",medianR,"%")
  Stop_stop_max$norm_value=" "
  Stop_stop_max$gravity = -1
  Stop_stop_max$suggestion_title="Revoir la section et la structure de son chapitre"
  Stop_stop_max$suggestion_content=""
  
  
  # arrets définitif de seances
  medianR = round(100* median(Ruptures$norecovery)/sum(Ruptures$norecovery),2)
  Stop_final_stop = Ruptures[which(Ruptures$norecovery>quantile(Ruptures$norecovery,0.8,na.rm = TRUE)),c('part_index','norecovery')]
  Stop_final_stop$norecovery=round(Stop_final_stop$norecovery * 100 / sum(Ruptures$norecovery),1)
  Stop_final_stop$classe="Stop"
  Stop_final_stop$issueCode="StopRSExit"
  Stop_final_stop$content=paste("Trop d’arrêts définitifs de la lecture sur cette section")
  Stop_final_stop$description=paste(Stop_final_stop$norecovery, "des fins définitives de la lecture  (sans reprises ultérieures) se passent sur cette section. La valeur médiane des arrêts définitifs sur les autres parties est de",medianR,"%")
  Stop_final_stop$norm_value=" "
  Stop_final_stop$gravity = -1
  Stop_final_stop$suggestion_title="Revoir la section et la structuration"
  Stop_final_stop$suggestion_content=""
  
  
  
  
  
  # RUPTURES AVEC REPRISES SUR LE PROCHAIN PART

  Stop_next_recovery = Ruptures[which(Ruptures$next_recovery<quantile(Ruptures$next_recovery,0.3,na.rm = TRUE)),c('part_index','next_recovery')]
  Stop_next_recovery$next_recovery=paste(round(Stop_next_recovery$next_recovery * 100 / sum(Ruptures$next_recovery),0)," %")
  Stop_next_recovery$classe="Stop"
  Stop_next_recovery$issueCode="StopRecNext"
  Stop_next_recovery$content=paste("Trop peu de reprise sur la section qui suit")
  Stop_next_recovery$description=paste("Uniquement",Stop_next_recovery$next_recovery, "des reprises de la lecture sont faites sur la section qui suit celle-ci")
  Stop_next_recovery$norm_value=" "
  Stop_next_recovery$gravity = -1
  Stop_next_recovery$suggestion_title="Revoir la section et la structuration"
  Stop_next_recovery$suggestion_content=""
  
  
  
  # RUPTURES BACK
  Stop_back_recovery = Ruptures[which(Ruptures$back_recovery>quantile(Ruptures$back_recovery,0.7,na.rm = TRUE)),c('part_index','back_recovery')]
  Stop_back_recovery$back_recovery=round(Stop_back_recovery$back_recovery * 100 / sum(Ruptures$back_recovery),1)
  Stop_back_recovery$classe="Stop"
  Stop_back_recovery$issueCode="StopRecback"
  Stop_back_recovery$content="de reprise sur des sections précédantes"
  Stop_back_recovery$description=paste("Lors de la reprise de la lecture après une fin sur cette section,",Stop_back_recovery$back_recovery, "% des reprises se font sur une partie en arrière")
  Stop_back_recovery$norm_value=" "
  Stop_back_recovery$gravity = -1
  Stop_back_recovery$suggestion_title="Revoir la section et la structuration"
  Stop_back_recovery$suggestion_content=""
  
  # RUPTURES SHIFTED
  Stop_shifted_recovery = Ruptures[which(Ruptures$shifted_recovery>quantile(Ruptures$shifted_recovery,0.8,na.rm = TRUE)),c('part_index','shifted_recovery')]
  Stop_shifted_recovery$shifted_recovery=round(Stop_shifted_recovery$shifted_recovery * 100 / sum(Ruptures$shifted_recovery),0)
  Stop_shifted_recovery$classe="Stop"
  Stop_shifted_recovery$issueCode="StopRecShift"
  Stop_shifted_recovery$content="Trop de reprise sur des sections suivantes éloignées"
  Stop_shifted_recovery$description=paste("Lors de la reprise de la lecture après une fin sur cette section,",Stop_shifted_recovery$shifted_recovery, "% des cas se font par un saut important en avant")
  Stop_shifted_recovery$norm_value=" "
  Stop_shifted_recovery$gravity = -1
  Stop_shifted_recovery$suggestion_title="Revoir la section et la structuration"
  Stop_shifted_recovery$suggestion_content=""
}


selectedCourse = "nodejs"
loadData(selectedCourse)
course_facts_read(selectedCourse)
course_facts_reread(selectedCourse)
course_facts_transition(selectedCourse)
course_facts_stop(selectedCourse)

names(Interest_nbvisites_vmin)[c(1,2)]=
  names(Interest_nbvisites_min)[c(1,2)]=
  names(Interest_nbvisites_max)[c(1,2)]=
  names(Interest_duration_vmin)[c(1,2)]=
  names(Interest_duration_min)[c(1,2)]=
  names(Interest_duration_max)[c(1,2)]=
  names(Rereads_rereadings_vmax)[c(1,2)]=
  names(Rereads_rereadings_max)[c(1,2)]=
  names(Rereads_rereadings_vmax)[c(1,2)]=
  names(Rereads_rereadings_max)[c(1,2)]=
  names(Rereads_Decaled_rereadings_vmax)[c(1,2)]=
  names(Rereads_Decaled_rereadings_max)[c(1,2)]=
  
 # names(Transition_provenance_precedent)[c(1,2)]=
#  names(Transition_provenance_precedent_v)[c(1,2)]=
#  names(Transition_provenance_next)[c(1,2)]=
 # names(Transition_provenance_next_v)[c(1,2)]=
  names(Transition_provenance_shiftednext)[c(1,2)]=
  names(Transition_provenance_shiftednext_v)[c(1,2)]=
  names(Transition_provenance_shiftedpast)[c(1,2)]=
  names(Transition_provenance_shiftedpast_v)[c(1,2)]=
 # names(Transition_Destination_next)[c(1,2)]=
#  names(Transition_Destination_next_v)[c(1,2)]=
#  names(Transition_Destination_prev)[c(1,2)]=
 # names(Transition_Destination_prev_v)[c(1,2)]=
  names(Transition_Destination_shiftedback)[c(1,2)]=
  names(Transition_Destination_shiftedback_v)[c(1,2)]=
#  names(Transition_Destination_shiftednext)[c(1,2)]=
 # names(Transition_Destination_shiftednext_v)[c(1,2)]=
  
   names(Stop_final_stop)[c(1,2)]=
   names(Stop_next_recovery)[c(1,2)]=
  names(Stop_back_recovery)[c(1,2)]=
  names(Stop_shifted_recovery)[c(1,2)]=c("id","value")

facts = 
  rbind(
    Interest_nbvisites_vmin,
    Interest_nbvisites_min,
    Interest_nbvisites_max,
    Interest_duration_vmin,
    Interest_duration_min,
    Interest_duration_max,
    Rereads_rereadings_vmax,
    Rereads_rereadings_max,
    Rereads_Decaled_rereadings_vmax,
    Rereads_Decaled_rereadings_max,
    # Transitions
    Transition_provenance_shiftednext,
    Transition_provenance_shiftednext_v,
    Transition_provenance_shiftedpast,
   #   Transition_provenance_shiftedpast_v,
    
#    Transition_Destination_next,
 
 #   Transition_Destination_prev,
    #Transition_Destination_prev_v,
    Transition_Destination_shiftedback,
        Transition_Destination_shiftedback_v,
    #    Transition_Destination_shiftednext,
     #   Transition_Destination_shiftednext_v,
    
    ##################################"
    
    Stop_final_stop,
   Stop_next_recovery,
    Stop_back_recovery,
    Stop_shifted_recovery)

  
names(facts)[1]="part_index"
facts$part_index=as.numeric(facts$part_index)
save(facts, file="nodejs.facts.rdata")
save(CourseStats, file="nodejs.CourseStats.rdata")


library('jsonlite')
library('reshape')

names(facts)[1]='id'
facts.json = toJSON(unname(split(facts, 1:nrow(facts))))
cat(facts.json, file="nodejs.facts.json")



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

PartData$rereads_tx = 0
s = s = sum(PartData[which(PartData$part_type=='section'),]$Rereadings)
PartData[which(PartData$part_type=='section'),]$rereads_tx =  100 * round(PartData[which(PartData$part_type=='section'),]$Rereadings / sum(PartData[which(PartData$part_type=='section'),]$Rereadings),2)
# for chapters
chaptersIds = PartData[which(PartData$part_type=='chapitre'),]$part_id
for(i in 1:length(chaptersIds)){
  PartData[which(PartData$part_id==chaptersIds[i]),]$rereads_tx =  sum(PartData[which(PartData$parent_id==chaptersIds[i]),]$rereads_tx)
}




save(PartData, file='PartData.rdata')
colnames(PartData)[1]="id"
colnames(PartData)[3]="parent_id"

meltParts=melt(PartData, id.vars = 'id')
PartsData.json = toJSON(unname(split(meltParts,1:nrow(meltParts))))
cat(PartsData.json, file="structure.json")

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

