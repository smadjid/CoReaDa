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
s = sum(PartData[which(PartData$part_type=='section'),]$Rereadings)
PartData[which(PartData$part_type=='section'),]$rereads_tx =  100 * round(PartData[which(PartData$part_type=='section'),]$Rereadings / sum(PartData[which(PartData$part_type=='section'),]$Rereadings),2)
# for chapters
chaptersIds = PartData[which(PartData$part_type=='chapitre'),]$part_id
for(i in 1:length(chaptersIds)){
  PartData[which(PartData$part_id==chaptersIds[i]),]$rereads_tx =  sum(PartData[which(PartData$parent_id==chaptersIds[i]),]$rereads_tx)
}


PartData$nfacts = 0
PartData$nfacts_readings = 0
PartData$nfacts_rereading = 0
PartData$nfacts_transition = 0
PartData$nfacts_stop = 0
sections =  PartData[which(PartData$part_type=='section'),]$part_index
for(i in 1:length(sections)){
  part =sections[i]
  PartData[which(PartData$part_index==part),]$nfacts_readings=nrow(facts[which(facts$part_index==part & facts$classe=='Readings'),])
  PartData[which(PartData$part_index==part),]$nfacts_rereading=nrow(facts[which(facts$part_index==part & facts$classe=='Rereading'),])
  PartData[which(PartData$part_index==part),]$nfacts_transition=nrow(facts[which(facts$part_index==part & facts$classe=='Transition'),])
  PartData[which(PartData$part_index==part),]$nfacts_stop=nrow(facts[which(facts$part_index==part & facts$classe=='Stop'),])
}
# Compute nfacts for chapters and tomes
chaptersIds = PartData[which(PartData$part_type=='chapitre'),]$part_id
for(i in 1:length(chaptersIds)){
  PartData[which(PartData$part_id==chaptersIds[i]),]$nfacts_readings =  sum(PartData[which(PartData$parent_id==chaptersIds[i]),]$nfacts_readings)
  PartData[which(PartData$part_id==chaptersIds[i]),]$nfacts_rereading =  sum(PartData[which(PartData$parent_id==chaptersIds[i]),]$nfacts_rereading)
  PartData[which(PartData$part_id==chaptersIds[i]),]$nfacts_transition =  sum(PartData[which(PartData$parent_id==chaptersIds[i]),]$nfacts_transition)
  PartData[which(PartData$part_id==chaptersIds[i]),]$nfacts_stop =  sum(PartData[which(PartData$parent_id==chaptersIds[i]),]$nfacts_stop)
}
tomesIds = PartData[which(PartData$part_type=='partie'),]$part_id
for(i in 1:length(tomesIds)){
  PartData[which(PartData$part_id==tomesIds[i]),]$nfacts_readings =  sum(PartData[which(PartData$parent_id==tomesIds[i]),]$nfacts_readings)
  PartData[which(PartData$part_id==tomesIds[i]),]$nfacts_rereading =  sum(PartData[which(PartData$parent_id==tomesIds[i]),]$nfacts_rereading)
  PartData[which(PartData$part_id==tomesIds[i]),]$nfacts_transition =  sum(PartData[which(PartData$parent_id==tomesIds[i]),]$nfacts_transition)
  PartData[which(PartData$part_id==tomesIds[i]),]$nfacts_stop =  sum(PartData[which(PartData$parent_id==tomesIds[i]),]$nfacts_stop)
}
PartData$nfacts = PartData$nfacts_readings + PartData$nfacts_rereading + PartData$nfacts_transition + PartData$nfacts_stop 

save(PartData, file='PartData.rdata')
colnames(PartData)[1]="id"
colnames(PartData)[3]="parent_id"